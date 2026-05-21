const { AIGeneration, Post } = require('../models');
const openaiService = require('../services/openai.service');

const generateStory = async (req, res) => {
  try {
    const { platform, topic, tone, brand, length } = req.body;
    if (!platform || !topic || !tone) {
      return res.status(400).json({ message: 'Platform, topic, and tone are required' });
    }

    const result = await openaiService.generateStory({ platform, topic, tone, brand: brand || '', length: length || 100 });

    await AIGeneration.create({
      userId: req.user.id,
      type: 'story',
      prompt: `Platform: ${platform}, Topic: ${topic}, Tone: ${tone}, Brand: ${brand || ''}`,
      result: result.text,
      platform,
      tone
    });

    res.json(result);
  } catch (error) {
    console.error('Generate story error:', error);
    res.status(500).json({ message: 'Server error generating story' });
  }
};

const generateImage = async (req, res) => {
  try {
    const { prompt, size, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const result = await openaiService.generateImage({ prompt, size, style });

    await AIGeneration.create({
      userId: req.user.id,
      type: 'image',
      prompt,
      result: result.imageUrl,
      platform: null,
      tone: style || 'vivid'
    });

    res.json(result);
  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({ message: 'Server error generating image' });
  }
};

const generateVideoScript = async (req, res) => {
  try {
    const { topic, duration, style, platform } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const result = await openaiService.generateVideoScript({ topic, duration: duration || '30', style: style || 'educational', platform: platform || 'YouTube' });

    await AIGeneration.create({
      userId: req.user.id,
      type: 'video_script',
      prompt: `Topic: ${topic}, Duration: ${duration}s, Style: ${style}, Platform: ${platform}`,
      result: result.script,
      platform,
      tone: style
    });

    res.json(result);
  } catch (error) {
    console.error('Generate video script error:', error);
    res.status(500).json({ message: 'Server error generating video script' });
  }
};

const generateAdCopy = async (req, res) => {
  try {
    const { product, audience, objective, platform, tone } = req.body;
    const result = await openaiService.generateAdCopy({ product, audience, objective, platform, tone });
    res.json(result);
  } catch (error) {
    console.error('Generate ad copy error:', error);
    res.status(500).json({ message: 'Server error generating ad copy' });
  }
};

const editContent = async (req, res) => {
  try {
    const { content, instruction } = req.body;
    if (!content || !instruction) {
      return res.status(400).json({ message: 'Content and instruction are required' });
    }

    const result = await openaiService.editContent({ content, instruction });
    res.json(result);
  } catch (error) {
    console.error('Edit content error:', error);
    res.status(500).json({ message: 'Server error editing content' });
  }
};

const getHistory = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { userId: req.user.id };
    if (type) where.type = type;

    const history = await AIGeneration.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

const useInPost = async (req, res) => {
  try {
    const { generationId, platforms } = req.body;
    if (!generationId) {
      return res.status(400).json({ message: 'generationId is required' });
    }

    const generation = await AIGeneration.findOne({
      where: { id: generationId, userId: req.user.id }
    });

    if (!generation) {
      return res.status(404).json({ message: 'Generation not found' });
    }

    let postContent = generation.result;
    let imageUrl = null;

    if (generation.type === 'image') {
      postContent = `Image generated with AI`;
      imageUrl = generation.result;
    }

    const post = await Post.create({
      userId: req.user.id,
      content: postContent,
      imageUrl,
      platforms: platforms || [],
      status: 'draft'
    });

    await generation.update({ usedInPost: true });

    res.status(201).json({ post, generation });
  } catch (error) {
    console.error('Use in post error:', error);
    res.status(500).json({ message: 'Server error creating post from generation' });
  }
};

module.exports = {
  generateStory,
  generateImage,
  generateVideoScript,
  generateAdCopy,
  editContent,
  getHistory,
  useInPost
};
