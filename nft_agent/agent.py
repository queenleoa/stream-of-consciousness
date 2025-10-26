import os
from final_curation_prompt import FINAL_CURATION_PROMPT
from analysis_prompt import ANALYSIS_PROMPT
from final_curation_json import FINAL_JSON_SAMPLE
from search import perform_all_searches
import json

from datetime import datetime
from uuid import uuid4
from openai import OpenAI
from uagents import Context, Protocol, Agent
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)
from dotenv import load_dotenv
load_dotenv()
asi1_api_key = os.getenv("ASI1_API_KEY")


##
### Example Expert Assistant
##
## NFT Curator Agent - 
#Message 1: User sends NFT data → Analysis → Store results
#Message 2: User sends "search" → Load results → Search → Done
#Message 3: (Later) User sends "curate" → Generate curation

def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end-session"))
    return ChatMessage(timestamp=datetime.utcnow(), msg_id=uuid4(), content=content)

# the subject that this assistant is an expert in
subject_matter = "Art and NFTs"

client = OpenAI(
    # By default, we are using the ASI-1 LLM endpoint and model
    base_url='https://api.asi1.ai/v1',

    # You can get an ASI-1 api key by creating an account at https://asi1.ai/dashboard/api-keys
    api_key= asi1_api_key,
)

agent = Agent()

# We create a new protocol which is compatible with the chat protocol spec. This ensures
# compatibility between agents
protocol = Protocol(spec=chat_protocol_spec)

async def handle_search_step(ctx: Context, sender: str):
    """
    Step 2: Execute search based on stored analysis
    This runs in a separate message, so it gets a fresh timeout window
    """
    # Load analysis from storage
    analysis_json = ctx.storage.get("analysis")
    
    if not analysis_json:
        await ctx.send(
            sender,
            create_text_chat(
                "❌ No analysis found. Please send NFT data first before using 'search'.",
                end_session=True
            )
        )
        return
    
    analysis = json.loads(analysis_json)
    
    ctx.logger.info("🔍 Starting Step 2: Search...")
    await ctx.send(
        sender,
        create_text_chat(
            "🔍 **Step 2: Searching for context...**\n\n"
            "Fetching Twitter, websites, and Google results...",
            end_session=False
        )
    )
    
    # Run searches - NOW with Twitter included (fresh timeout!)
    search_results = await perform_all_searches(ctx, analysis)
    
    # Store results for Step 3 (later)
    ctx.storage.set("search_results", json.dumps(search_results))
    
    # Send Twitter results
    twitter_data = search_results.get("twitter_data", {})
    if twitter_data:
        status = "✅" if twitter_data.get("success") else "⚠️"
        twitter_response = f"🐦 **Twitter:** {status}\n\n```json\n{json.dumps(twitter_data, indent=2)[:3000]}\n```"
        await ctx.send(sender, create_text_chat(twitter_response, end_session=False))
    
    # Send Website results
    website_content = search_results.get("website_content", [])
    if website_content:
        website_response = f"🌐 **Websites:** {len(website_content)} fetched\n\n```json\n{json.dumps(website_content, indent=2)[:3000]}\n```"
        await ctx.send(sender, create_text_chat(website_response, end_session=False))
    
    # Send Google results
    google_searches = search_results.get("google_searches", [])
    if google_searches:
        google_response = f"🔍 **Google:** {len(google_searches)} queries\n\n```json\n{json.dumps(google_searches, indent=2)[:3000]}\n```"
        await ctx.send(sender, create_text_chat(google_response, end_session=False))
    
    # Done
    await ctx.send(
        sender,
        create_text_chat(
            "✨ **Step 2 Complete!**\n\n"
            "(Step 3 'curate' coming later)",
            end_session=True
        )
    )


### this is for the first analysis 
async def analyze_nft_data(ctx: Context, data_dump: str) -> dict:
    """
    Send everything to LLM - extract image URL and send for actual visual analysis.
    """
    try:
        # Extract image URL from the JSON dump
        image_url = None
        
        try:
            # Parse the data dump as JSON
            data = json.loads(data_dump)
            
            # Check multiple possible locations for image URL
            # OpenSea NFT data structure
            if isinstance(data, dict):
                # Direct image fields
                for key in ['image', 'image_url', 'imageUrl', 'image_original_url', 'display_image_url']:
                    if key in data and data[key]:
                        image_url = data[key]
                        break
                
                # Check in metadata
                if not image_url and 'metadata' in data:
                    metadata = data['metadata']
                    for key in ['image', 'image_url', 'imageUrl']:
                        if key in metadata and metadata[key]:
                            image_url = metadata[key]
                            break
                
                # Check in token (indexer format)
                if not image_url and 'token' in data:
                    token = data['token']
                    for key in ['image', 'image_url', 'imageUrl', 'display_image_url']:
                        if key in token and token[key]:
                            image_url = token[key]
                            break
                
                # Animation URL as fallback
                if not image_url:
                    for key in ['animation_url', 'animationUrl']:
                        if key in data and data[key]:
                            image_url = data[key]
                            break
        
        except json.JSONDecodeError:
            # If it's not JSON, try regex to find URLs
            import re
            url_pattern = r'https?://[^\s<>"]+?\.(?:jpg|jpeg|png|gif|webp|svg)'
            urls = re.findall(url_pattern, data_dump, re.IGNORECASE)
            if urls:
                image_url = urls[0]
        
        # Convert IPFS URLs to HTTP gateway URLs
        if image_url and image_url.startswith('ipfs://'):
            ipfs_hash = image_url.replace('ipfs://', '')
            image_url = f'https://ipfs.io/ipfs/{ipfs_hash}'
            ctx.logger.info(f"Converted IPFS URL to: {image_url}")
        
        # Format the prompt
        prompt = ANALYSIS_PROMPT.format(data_dump=data_dump)
        
        ctx.logger.info("Sending data to LLM for analysis...")
        
        # Build messages with vision support if we have an image
        if image_url:
            ctx.logger.info(f"✓ Including image for visual analysis: {image_url}")
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert NFT analyst with vision capabilities. You can see and analyze the artwork image. Return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                                "detail": "high"
                            }
                        }
                    ]
                }
            ]
        else:
            ctx.logger.warning("⚠️ No image URL found - text-only analysis")
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert NFT analyst. No image was provided. Return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        
        # Call LLM with vision support
        response = client.chat.completions.create(
            model="asi1-extended",
            messages=messages,
            max_tokens=20000,
            temperature=0.8
        )
        
        result = response.choices[0].message.content
        
        # Parse JSON
        try:
            analysis = json.loads(result)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            start = result.find('{')
            end = result.rfind('}') + 1
            if start != -1 and end > start:
                analysis = json.loads(result[start:end])
            else:
                raise ValueError("LLM did not return valid JSON")
        
        ctx.logger.info("Analysis complete")
        return analysis
        
    except Exception as e:
        ctx.logger.exception('Error during analysis')
        return {
            "error": str(e),
            "extracted_info": {},
            "image_analysis": {
                "image_url": None,
                "needs_metadata_fetch": False,
                "visual_description": "Analysis failed"
            },
            "categorized_links": {},
            "search_queries": {"twitter": [], "web": []},
            "key_themes": [],
            "focus_areas": [],
            "data_quality_notes": f"Error: {str(e)}"
        }

# This handles final curation
async def handle_curate_step(ctx: Context, sender: str, awakened_by: str = "Unknown"):
    """
    Step 3: Generate final curation using stored analysis and search results
    NOW: Only uses analysis (required) and search_results (optional)
    Removed: data_dump to save tokens
    """
    # Load stored data - only analysis is required now
    analysis_json = ctx.storage.get("analysis")
    search_results_json = ctx.storage.get("search_results")
    
    if not analysis_json:
        await ctx.send(
            sender,
            create_text_chat(
                "❌ No analysis found. Please run Step 1 (send NFT data) first.",
                end_session=True
            )
        )
        return
    
    analysis = json.loads(analysis_json)
    search_results = json.loads(search_results_json) if search_results_json else {}
    
    ctx.logger.info("🎭 Starting Step 3: Final Curation...")
    await ctx.send(
        sender,
        create_text_chat(
            "🎭 **Step 3: Generating Final Curation...**\n\n"
            "Creating comprehensive curator analysis...",
            end_session=False
        )
    )
    
    try:
        # Format search results concisely
        search_results_text = json.dumps(search_results, indent=2) if search_results else "No search results"
        
        # Much simpler prompt now - no data_dump
        final_prompt = FINAL_CURATION_PROMPT.format(
            analysis=json.dumps(analysis, indent=2),
            search_results=search_results_text,
            awakened_by=awakened_by,
            FINAL_JSON_SAMPLE=FINAL_JSON_SAMPLE
        )
        
        # Log token estimate
        estimated_input_tokens = len(final_prompt) / 4  # rough estimate
        ctx.logger.info(f"Estimated input tokens: ~{int(estimated_input_tokens)}")
        
        ctx.logger.info("Sending to LLM for final curation...")
        
        # Call LLM with very high token limit
        response = client.chat.completions.create(
            model="asi1-extended",
            messages=[
                {
                    "role": "system",
                    "content": "You are a high art curator. Return ONLY raw JSON - no markdown blocks, no explanations. Start with { and end with }."
                },
                {
                    "role": "user",
                    "content": final_prompt
                }
            ],
            max_tokens=64000,  # Increased significantly
            temperature=0.8
        )
        
        raw_result = response.choices[0].message.content
        
        # Store raw response
        ctx.storage.set("raw_curation_response", raw_result)
        
        # Log response info
        ctx.logger.info(f"Raw response: {len(raw_result)} chars")
        ctx.logger.info(f"Starts: {raw_result[:100]}")
        ctx.logger.info(f"Ends: {raw_result[-100:]}")
        
        # Send debug info
        await ctx.send(
            sender,
            create_text_chat(
                f"📊 **Debug:**\n"
                f"- Input tokens: ~{int(estimated_input_tokens)}\n"
                f"- Response: {len(raw_result)} chars\n"
                f"- Start: {raw_result[:150]}\n"
                f"- End: {raw_result[-150:]}",
                end_session=False
            )
        )
        
        # Parse with multiple strategies
        curation_json = None
        
        # Strategy 1: Direct parse
        try:
            curation_json = json.loads(raw_result)
            ctx.logger.info("✓ Direct parse succeeded")
        except json.JSONDecodeError as e:
            ctx.logger.warning(f"Direct parse failed: {e}")
            
            # Strategy 2: Remove markdown
            try:
                cleaned = raw_result
                if "```json" in cleaned:
                    cleaned = cleaned.split("```json")[1].split("```")[0]
                elif "```" in cleaned:
                    cleaned = cleaned.split("```")[1].split("```")[0]
                curation_json = json.loads(cleaned.strip())
                ctx.logger.info("✓ Markdown removal succeeded")
            except (json.JSONDecodeError, IndexError) as e:
                ctx.logger.warning(f"Markdown removal failed: {e}")
                
                # Strategy 3: Extract JSON boundaries
                try:
                    start = raw_result.find('{')
                    end = raw_result.rfind('}') + 1
                    if start != -1 and end > start:
                        json_str = raw_result[start:end]
                        curation_json = json.loads(json_str)
                        ctx.logger.info("✓ Boundary extraction succeeded")
                except (json.JSONDecodeError, ValueError) as e:
                    ctx.logger.error(f"All strategies failed: {e}")
                    
                    # Send raw response for inspection
                    await ctx.send(
                        sender,
                        create_text_chat(
                            f"❌ **Parsing failed!**\n\n"
                            f"Error: {str(e)}\n\n"
                            f"First 800 chars:\n```\n{raw_result[:800]}\n```\n\n"
                            f"Last 800 chars:\n```\n{raw_result[-800:]}\n```",
                            end_session=True
                        )
                    )
                    return
        
        # Success!
        ctx.storage.set("curation", json.dumps(curation_json))
        ctx.logger.info("✅ Curation complete!")
        
        # Send truncated preview
        preview = json.dumps(curation_json, indent=2)
        if len(preview) > 3500:
            preview = preview[:3500] + "\n... (truncated, full in storage)"
        
        await ctx.send(
            sender,
            create_text_chat(
                f"✨ **Step 3 Complete!**\n\n```json\n{preview}\n```",
                end_session=True
            )
        )
        
    except Exception as e:
        ctx.logger.exception('Error during curation')
        raw = ctx.storage.get("raw_curation_response")
        debug = f"\n\n**Raw (first 500):**\n```\n{raw[:500] if raw else 'N/A'}\n```" if raw else ""
        
        await ctx.send(
            sender,
            create_text_chat(
                f"❌ Error: {str(e)}{debug}",
                end_session=True
            )
        )


# We define the handler for the chat messages that are sent to your agent
@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    # send the acknowledgement for receiving the message
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(), acknowledged_msg_id=msg.msg_id),
    )

    # 2) greet if a session starts
    if any(isinstance(item, StartSessionContent) for item in msg.content):
        await ctx.send(
            sender,
            create_text_chat(f"Hi! Im a {subject_matter} expert, how can I help?", end_session=False),
        )

    text = msg.text()
    if not text:
        return

    try:
        # Route based on command
        command = text.lower().strip()
        
        if command == "search":
            # ========== STEP 2: SEARCH ==========
            await handle_search_step(ctx, sender)
            return

        elif command.startswith("curate"):
            # ========== STEP 3: CURATE ==========
            # Optional: Extract awakened_by address from command
            # Format: "curate 0xabcd..." or just "curate"
            parts = text.split()
            awakened_by = parts[1] if len(parts) > 1 else "Unknown"
            await handle_curate_step(ctx, sender, awakened_by)
            return    
        
        # Otherwise, treat as NFT data for analysis
        # ========== STEP 1: INITIAL ANALYSIS ==========
        ctx.logger.info("🎨 Starting Step 1: Initial Analysis...")
        await ctx.send(
            sender,
            create_text_chat("🎨 **Step 1: Analyzing NFT data...**\n\nExtracting key information, analyzing artwork, and preparing search queries.", end_session=False)
        )
        # IMPORTANT: Store the original data_dump for Step 3
        ctx.storage.set("data_dump", text)        
        analysis = await analyze_nft_data(ctx, text)
        
        if "error" in analysis:
            await ctx.send(
                sender,
                create_text_chat(f"❌ Error during analysis: {analysis['error']}", end_session=True)
            )
            return
        
       # Store analysis for Step 2
        ctx.storage.set("analysis", json.dumps(analysis))
        
        # Send analysis results
        analysis_response = (
            "✅ **Step 1 Complete: Initial Analysis**\n\n"
            f"```json\n{json.dumps(analysis, indent=2)[:3000]}\n```\n\n"
            "📊 **Next:** Send the message **'search'** to fetch Twitter, websites, and Google results."
        )
        await ctx.send(
            sender,
            create_text_chat(analysis_response, end_session=True)
        )
        return
        

    except Exception as e:
        ctx.logger.exception('Error processing request')
        response = f"❌ An error occurred while processing the request: {str(e)}"
        await ctx.send(sender, create_text_chat(response, end_session=True))

        

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    # we are not interested in the acknowledgements for this example, but they can be useful to
    # implement read receipts, for example.
    pass


# attach the protocol to the agent
agent.include(protocol, publish_manifest=True)
    