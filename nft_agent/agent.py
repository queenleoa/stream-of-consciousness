import os
from final_prompt import FINAL_CURATION_PROMPT
from analysis_prompt import ANALYSIS_PROMPT
from final_json import FINAL_JSON_SAMPLE
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
## Step1: Accepts NFT data from multiple sources, analyzes,  

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
        analysis = await analyze_nft_data(ctx, text)
        
        if "error" in analysis:
            await ctx.send(
                sender,
                create_text_chat(f"❌ Error: {analysis['error']}", end_session=True)
            )
            return
        
        # JSON nice response
        response = json.dumps(analysis, indent=2)  # ← Fix: stringify the dict

        

    except Exception as e:
        ctx.logger.exception('Error querying model')
        response = f"An error occurred while processing the request. Please try again later. {e}"

    await ctx.send(sender, create_text_chat(response, end_session=True))


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    # we are not interested in the acknowledgements for this example, but they can be useful to
    # implement read receipts, for example.
    pass


# attach the protocol to the agent
agent.include(protocol, publish_manifest=True)
    