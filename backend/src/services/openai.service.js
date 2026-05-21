let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  OpenAI = null;
}

const getClient = () => {
  if (!process.env.OPENAI_API_KEY || !OpenAI) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const generateStory = async ({ platform, topic, tone, brand, length }) => {
  const client = getClient();
  if (!client) {
    return {
      text: `🚀 Exciting news! [Mock AI story about ${topic}] #trending #${platform}`,
      hashtags: ['#trending', `#${platform}`]
    };
  }
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert social media content creator.' },
      {
        role: 'user',
        content: `Write a ${tone} ${platform} post about ${topic} for brand: ${brand}. Length: ${length} words. Include relevant hashtags.`
      }
    ]
  });
  const text = response.choices[0].message.content;
  const hashtagMatches = text.match(/#\w+/g) || [];
  return { text, hashtags: hashtagMatches };
};

const generateImage = async ({ prompt, size, style }) => {
  const client = getClient();
  if (!client) {
    return {
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`,
      isMock: true
    };
  }
  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: size || '1024x1024',
    style: style || 'vivid'
  });
  return { imageUrl: response.data[0].url };
};

const generateVideoScript = async ({ topic, duration, style, platform }) => {
  const client = getClient();
  if (!client) {
    return {
      script: `[HOOK]\nGrab attention with an exciting opening about ${topic}.\n\n[MAIN CONTENT]\nDive deep into ${topic} with engaging ${style} content tailored for ${platform}.\n\n[CTA]\nLike, share, and follow for more content like this!`,
      scenes: [
        { time: '0-5s', description: 'Opening shot', voiceover: `Welcome to this ${style} video about ${topic}` },
        { time: `5-${Math.floor(parseInt(duration) * 0.7)}s`, description: 'Main content', voiceover: `Here is the main content about ${topic}` },
        { time: `${Math.floor(parseInt(duration) * 0.7)}s-end`, description: 'Call to action', voiceover: 'Like and follow for more!' }
      ]
    };
  }
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert video script writer.' },
      {
        role: 'user',
        content: `Write a ${duration}-second ${style} video script for ${platform} about: ${topic}. Format: [HOOK], [MAIN CONTENT], [CTA]. Include scene descriptions. After the script, add a JSON array of scenes with fields: time, description, voiceover. Wrap the JSON in <scenes> tags.`
      }
    ]
  });
  const content = response.choices[0].message.content;
  let scenes = [];
  const scenesMatch = content.match(/<scenes>([\s\S]*?)<\/scenes>/);
  if (scenesMatch) {
    try {
      scenes = JSON.parse(scenesMatch[1].trim());
    } catch (e) {
      scenes = [];
    }
  }
  const script = content.replace(/<scenes>[\s\S]*?<\/scenes>/, '').trim();
  return { script, scenes };
};

const generateAdCopy = async ({ product, audience, objective, platform, tone }) => {
  const client = getClient();
  if (!client) {
    return {
      headline: `Discover ${product} — Perfect for ${audience}`,
      body: `Looking for the best solution? ${product} delivers exactly what ${audience} needs. Achieve your ${objective} goals with our proven approach.`,
      callToAction: 'Get Started Today'
    };
  }
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert advertising copywriter.' },
      {
        role: 'user',
        content: `Write ${tone} ad copy for ${platform} for product/service: "${product}". Target audience: ${audience}. Objective: ${objective}. Return JSON with fields: headline (max 60 chars), body (max 150 chars), callToAction (max 20 chars). Return only the JSON object.`
      }
    ],
    response_format: { type: 'json_object' }
  });
  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (e) {
    return {
      headline: `Discover ${product}`,
      body: `Perfect for ${audience}. Achieve your ${objective} goals.`,
      callToAction: 'Learn More'
    };
  }
};

const editContent = async ({ content, instruction }) => {
  const client = getClient();
  if (!client) {
    return {
      editedContent: `${content} [Edited: ${instruction}]`
    };
  }
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert content editor.' },
      {
        role: 'user',
        content: `Edit the following content: ${content}. Instruction: ${instruction}. Return only the edited content.`
      }
    ]
  });
  return { editedContent: response.choices[0].message.content };
};

module.exports = {
  generateStory,
  generateImage,
  generateVideoScript,
  generateAdCopy,
  editContent
};
