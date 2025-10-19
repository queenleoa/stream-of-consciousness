// Card content data separated from presentation

export const leftBankCards = [
  {
    id: 'left-1',
    title: 'Minting History',
    type: 'summary',
    color: '#4dd0e1', // Cyan
    position: [-5, 1, 4],
    preview: 'This artwork was minted across multiple chains...',
    fullContent: {
      summary: 'AI Summary: This artwork was originally minted on Ethereum by artist 0x3A...9f on June 14, 2024. It has since been bridged to Arbitrum and Polygon, creating a multi-chain presence.',
      details: [
        'Original mint: Ethereum',
        'Additional chains: Arbitrum, Polygon',
        'Total mints: 3',
        'Creator: 0x3A...9f'
      ]
    }
  },
  {
    id: 'left-2',
    title: 'Minting Details',
    type: 'appendix',
    color: '#7c4dff', // Deep Purple
    position: [-7, 2, -3],
    preview: 'Transaction links and chain data...',
    fullContent: {
      appendix: [
        {
          label: 'Ethereum Mint',
          link: 'etherscan.io/tx/0x...',
          date: '2024-06-14'
        },
        {
          label: 'Arbitrum Bridge',
          link: 'arbiscan.io/tx/0x...',
          date: '2024-07-22'
        },
        {
          label: 'Polygon Bridge',
          link: 'polygonscan.com/tx/0x...',
          date: '2024-08-05'
        }
      ]
    }
  },
  {
    id: 'left-3',
    title: 'Transfer & Listings',
    type: 'summary',
    color: '#00bcd4', // Cyan
    position: [-7, 1, -10],
    preview: 'The artwork changed hands 3 times...',
    fullContent: {
      summary: 'AI Summary: The artwork has been transferred 3 times since minting. Currently listed on OpenSea for 42 ETH. Previously sold for 35 ETH on Foundation.',
      details: [
        'Total transfers: 3',
        'Current listing: 42 ETH (OpenSea)',
        'Last sale: 35 ETH (Foundation)',
        'Current owner: 0x72...c4'
      ]
    }
  },
  {
    id: 'left-4',
    title: 'Transaction History',
    type: 'appendix',
    color: '#536dfe', // Indigo
    position: [-7, 2, -17],
    preview: 'Complete transaction log...',
    fullContent: {
      appendix: [
        {
          type: 'Mint',
          from: '0x0000...0000',
          to: '0x3A...9f',
          price: 'Free mint',
          date: '2024-06-14'
        },
        {
          type: 'Sale',
          from: '0x3A...9f',
          to: '0x4B...2a',
          price: '20 ETH',
          date: '2024-06-28'
        },
        {
          type: 'Transfer',
          from: '0x4B...2a',
          to: '0x72...c4',
          price: '35 ETH',
          date: '2024-08-15'
        }
      ]
    }
  },
  {
    id: 'left-5',
    title: 'Mint Your Note',
    type: 'action',
    color: '#18ffff', // Bright Cyan
    position: [-7, 1, -24],
    preview: 'Add your critique to the chain...',
    fullContent: {
      actionType: 'mint-comment',
      description: 'Share your thoughts about this artwork and mint them permanently on-chain.',
      buttonText: 'Mint Comment'
    }
  },
  {
    id: 'left-6',
    title: 'On-Chain Notes',
    type: 'list',
    color: '#448aff', // Blue
    position: [-7, 2, -31],
    preview: '5 collectors have shared their thoughts...',
    fullContent: {
      notes: [
        {
          author: '0x5C...8d',
          comment: 'This piece made me cry. The use of light is transcendent.',
          date: '2024-09-01'
        },
        {
          author: '0x2F...1a',
          comment: 'Revolutionary composition. A new standard for digital art.',
          date: '2024-08-20'
        }
      ]
    }
  }
];

export const rightBankCards = [
  {
    id: 'right-1',
    title: 'About the Artist',
    type: 'summary',
    color: '#ff6e40', // Deep Orange
    position: [6, 1, 3],
    preview: 'Digital artist exploring consciousness...',
    fullContent: {
      summary: 'AI Summary: The artist is a renowned digital creator known for exploring themes of consciousness and reality. Active since 2019, they have exhibited at major galleries including Dubst Digital.',
      details: [
        'Active since: 2019',
        'Style: Surrealist Digital',
        'Notable exhibitions: 5+',
        'Social presence: Strong'
      ]
    }
  },
  {
    id: 'right-2',
    title: 'Artist Links',
    type: 'appendix',
    color: '#ff5252', // Red
    position: [7, 2, -4],
    preview: 'Portfolio and social media...',
    fullContent: {
      appendix: [
        {
          platform: 'Website',
          link: 'artist-portfolio.com',
          followers: '-'
        },
        {
          platform: 'Twitter',
          link: '@artist',
          followers: '45.2K'
        },
        {
          platform: 'Instagram',
          link: '@artist',
          followers: '78.3K'
        },
        {
          platform: 'Foundation',
          link: 'foundation.app/@artist',
          followers: '12.1K'
        }
      ]
    }
  },
  {
    id: 'right-3',
    title: 'Artwork Context',
    type: 'summary',
    color: '#ff4081', // Pink
    position: [7, 1, -11],
    preview: 'Inspired by consciousness studies...',
    fullContent: {
      summary: 'AI Summary: This artwork is part of the "Stream of Consciousness" series, inspired by William James\' philosophical writings and modern neuroscience. The flowing forms represent thoughts merging with memory.',
      details: [
        'Series: Stream of Consciousness',
        'Influences: Surrealism, Neuroscience',
        'Medium: Digital 3D + AI',
        'Year: 2024'
      ]
    }
  },
  {
    id: 'right-4',
    title: 'Related Works',
    type: 'appendix',
    color: '#e91e63', // Pink
    position: [7, 2, -18],
    preview: 'Similar pieces and inspirations...',
    fullContent: {
      appendix: [
        {
          title: 'Flow State #1',
          artist: 'Same artist',
          year: '2023',
          link: '#'
        },
        {
          title: 'The Persistence of Memory',
          artist: 'Salvador Dalí',
          year: '1931',
          link: '#'
        },
        {
          title: 'Digital Dreams',
          artist: 'Contemporary',
          year: '2024',
          link: '#'
        }
      ]
    }
  },
  {
    id: 'right-5',
    title: 'Social Discourse',
    type: 'summary',
    color: '#ff6f00', // Amber
    position: [7, 1, -25],
    preview: 'Community reactions and discussions...',
    fullContent: {
      summary: 'AI Summary: The artwork sparked vibrant discussion across social media. Critics praised its emotional depth while collectors highlighted the technical execution. Overall sentiment: 94% positive.',
      details: [
        'Total mentions: 247',
        'Positive sentiment: 94%',
        'Average rating: 4.8/5',
        'Most discussed: Emotional impact'
      ]
    }
  },
  {
    id: 'right-6',
    title: 'Featured Posts',
    type: 'social',
    color: '#ff3d00', // Deep Orange
    position: [7, 2, -32],
    preview: 'Top social media posts...',
    fullContent: {
      posts: [
        {
          platform: 'Twitter',
          author: '@artcritic',
          text: 'This place made merry - absolutely stunning work that captures the essence of flowing thought.',
          likes: 1243,
          date: '2024-09-10'
        },
        {
          platform: 'Instagram',
          author: '@collector',
          text: 'Just acquired this piece. Every time I look at it, I discover something new.',
          likes: 892,
          date: '2024-08-16'
        }
      ]
    }
  }
];