// Generates realistic demo data for all API endpoints
// Used when localStorage.getItem('demo_mode') === 'true'

const today = new Date()
const fmt = (d) => d.toISOString().split('T')[0]
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d) }

// 30 days of growth data
const growthData = Array.from({ length: 30 }, (_, i) => {
  const base = 30 - i
  return {
    date: daysAgo(base),
    facebook:  12000 + Math.floor(Math.sin(i * 0.4) * 800 + i * 120),
    instagram: 28000 + Math.floor(Math.cos(i * 0.3) * 600 + i * 200),
    twitter:   9500  + Math.floor(Math.sin(i * 0.5) * 400 + i * 80),
    linkedin:  5200  + Math.floor(Math.cos(i * 0.6) * 300 + i * 60),
  }
})

const engagementData = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgo(13 - i),
  facebook_likes: 320 + Math.floor(Math.random() * 180),
  facebook_comments: 45 + Math.floor(Math.random() * 30),
  facebook_shares: 28 + Math.floor(Math.random() * 20),
  instagram_likes: 890 + Math.floor(Math.random() * 400),
  instagram_comments: 120 + Math.floor(Math.random() * 60),
  instagram_shares: 65 + Math.floor(Math.random() * 40),
}))

const posts = [
  { id:'p1', content:'🚀 Excited to announce our new AI-powered analytics dashboard! Real-time insights for every platform in one place. #SocialMedia #Analytics #AI', platforms:['instagram','facebook'], status:'published', scheduledAt: daysAgo(1) + 'T10:00:00Z', publishedAt: daysAgo(1) + 'T10:00:00Z', engagement:{ likes:842, comments:67, shares:134, reach:12400 }, createdAt: daysAgo(2) + 'T08:00:00Z' },
  { id:'p2', content:'Tips for growing your Instagram in 2025:\n✅ Post consistently\n✅ Use Reels\n✅ Engage with comments\n✅ Use relevant hashtags\n\nWhich tip works best for you?', platforms:['instagram','twitter'], status:'published', scheduledAt: daysAgo(3) + 'T14:00:00Z', publishedAt: daysAgo(3) + 'T14:00:00Z', engagement:{ likes:1240, comments:198, shares:89, reach:28900 }, createdAt: daysAgo(4) + 'T09:00:00Z' },
  { id:'p3', content:'Behind the scenes of our latest product shoot 📸 Our team worked hard to capture the perfect shots for the new collection launch!', platforms:['instagram'], status:'scheduled', scheduledAt: new Date(today.getTime() + 86400000).toISOString(), publishedAt: null, engagement:{ likes:0, comments:0, shares:0, reach:0 }, createdAt: daysAgo(1) + 'T11:00:00Z' },
  { id:'p4', content:'LinkedIn milestone: We just hit 5,000 followers! Thank you to our amazing community for the support. Here\'s to the next 5,000! 🎉', platforms:['linkedin'], status:'published', scheduledAt: daysAgo(5) + 'T09:00:00Z', publishedAt: daysAgo(5) + 'T09:00:00Z', engagement:{ likes:432, comments:89, shares:56, reach:8700 }, createdAt: daysAgo(6) + 'T07:00:00Z' },
  { id:'p5', content:'New blog post: "10 Social Media Trends to Watch in 2025" — link in bio! We break down exactly what\'s working right now across every major platform.', platforms:['facebook','linkedin','twitter'], status:'draft', scheduledAt: null, publishedAt: null, engagement:{ likes:0, comments:0, shares:0, reach:0 }, createdAt: daysAgo(0) + 'T13:00:00Z' },
  { id:'p6', content:'Monday motivation 💪 "Success is not final, failure is not fatal: it is the courage to continue that counts." — Churchill\n\n#MondayMotivation #Mindset', platforms:['instagram','facebook','twitter'], status:'published', scheduledAt: daysAgo(7) + 'T08:00:00Z', publishedAt: daysAgo(7) + 'T08:00:00Z', engagement:{ likes:2100, comments:142, shares:310, reach:41200 }, createdAt: daysAgo(8) + 'T18:00:00Z' },
]

const platforms = [
  { id:'pl1', name:'facebook',  accountName:'Metricool Official', accountId:'fb_123', isConnected:true, followers:12840, createdAt: daysAgo(30) },
  { id:'pl2', name:'instagram', accountName:'@metricool',         accountId:'ig_456', isConnected:true, followers:28560, createdAt: daysAgo(30) },
  { id:'pl3', name:'twitter',   accountName:'@metricool',         accountId:'tw_789', isConnected:true, followers:9720,  createdAt: daysAgo(25) },
  { id:'pl4', name:'linkedin',  accountName:'Metricool',          accountId:'li_012', isConnected:true, followers:5190,  createdAt: daysAgo(20) },
]

const adAccounts = [
  { id:'aa1', platform:'facebook',  accountName:'Metricool FB Ads',     accountId:'act_111', currency:'USD', totalBudget:2000, spentBudget:847,  isConnected:true },
  { id:'aa2', platform:'google',    accountName:'Metricool Google Ads',  accountId:'act_222', currency:'USD', totalBudget:3000, spentBudget:1240, isConnected:true },
  { id:'aa3', platform:'linkedin',  accountName:'Metricool LI Ads',      accountId:'act_333', currency:'USD', totalBudget:1500, spentBudget:392,  isConnected:true },
  { id:'aa4', platform:'tiktok',    accountName:'Metricool TikTok Ads',  accountId:'act_444', currency:'USD', totalBudget:800,  spentBudget:210,  isConnected:false },
]

const adCampaigns = [
  { id:'ac1', adAccountId:'aa1', name:'Summer Product Launch', objective:'conversions', status:'active', dailyBudget:50, totalBudget:500, startDate: daysAgo(10), endDate:null, platforms:['facebook','instagram'], impressions:110000, clicks:3740, conversions:265, spend:210, aiGenerated:true, targeting:{ ageMin:25, ageMax:45, locations:['United States','Canada'], interests:['Social Media','Marketing','Technology'] }, creative:{ headline:'Launch Your Brand Faster', body:'All-in-one social media management platform. Try free for 14 days.', callToAction:'Start Free Trial', imageUrl:'' }, createdAt: daysAgo(12) },
  { id:'ac2', adAccountId:'aa2', name:'Brand Awareness Q2',    objective:'awareness',   status:'active', dailyBudget:80, totalBudget:800, startDate: daysAgo(5),  endDate:null, platforms:['google'],                 impressions:44000,  clicks:1496, conversions:106, spend:84,  aiGenerated:false, targeting:{ ageMin:22, ageMax:55, locations:['United States'], interests:['Business','Entrepreneurship'] }, creative:{ headline:'Grow Your Social Presence', body:'Schedule, analyze, and optimize your social media with AI.', callToAction:'Learn More', imageUrl:'' }, createdAt: daysAgo(7) },
]

const aiHistory = [
  { id:'h1', type:'story',        prompt:'New product launch for social media app',    platform:'instagram', tone:'professional', result:'🚀 Exciting news!...', usedInPost:true,  createdAt: daysAgo(1) + 'T10:00:00Z' },
  { id:'h2', type:'image',        prompt:'Modern tech office with team collaboration', platform:null,        tone:null,           result:'https://picsum.photos/seed/office1/800/800', usedInPost:false, createdAt: daysAgo(2) + 'T14:00:00Z' },
  { id:'h3', type:'ad_copy',      prompt:'SaaS product for social media managers',     platform:'facebook',  tone:'professional', result:'{"headline":"..."}', usedInPost:false, createdAt: daysAgo(3) + 'T09:00:00Z' },
  { id:'h4', type:'video_script', prompt:'30s promo video for Instagram Reels',        platform:'instagram', tone:null,           result:'[HOOK]...', usedInPost:false, createdAt: daysAgo(4) + 'T16:00:00Z' },
  { id:'h5', type:'story',        prompt:'Monday motivation post for LinkedIn',         platform:'linkedin',  tone:'inspirational',result:'Start your week strong...', usedInPost:true, createdAt: daysAgo(5) + 'T08:00:00Z' },
]

// Route matcher — returns mock data for a given method + URL
export function getMockResponse(method, url, data) {
  const path = url.replace('/api', '').split('?')[0]
  const m = method.toLowerCase()

  // Auth
  if (m === 'post' && path === '/auth/login')
    return { token: 'demo_token_xyz', user: { id:'demo1', name:'Rangarajan Gavi', email:'demo@metricool.com', avatar:null } }
  if (m === 'post' && path === '/auth/register')
    return { token: 'demo_token_xyz', user: { id:'demo1', name: data?.name || 'Demo User', email: data?.email || 'demo@metricool.com', avatar:null } }
  if (m === 'get'  && path === '/auth/me')
    return { id:'demo1', name:'Rangarajan Gavi', email:'demo@metricool.com' }

  // Analytics
  if (m === 'get' && path === '/analytics/overview')
    return { totalFollowers:56310, totalReach:412800, totalPosts:posts.length, avgEngagementRate:4.8, totalLikes:8240, totalComments:642 }
  if (m === 'get' && path === '/analytics/growth')
    return growthData
  if (m === 'get' && path === '/analytics/engagement')
    return engagementData
  if (m === 'get' && path === '/analytics/top-posts')
    return posts.filter(p => p.status === 'published').sort((a,b) => (b.engagement.likes+b.engagement.comments+b.engagement.shares) - (a.engagement.likes+a.engagement.comments+a.engagement.shares)).slice(0,5)

  // Posts
  if (m === 'get'  && path === '/posts')           return posts
  if (m === 'post' && path === '/posts')           return { ...data, id:'new_'+Date.now(), status:'draft', engagement:{likes:0,comments:0,shares:0,reach:0}, createdAt:new Date().toISOString() }
  if (m === 'get'  && path === '/posts/calendar')  return posts.filter(p => p.scheduledAt)
  if (m === 'put'  && path.startsWith('/posts/'))  return { ...data, id: path.split('/')[2] }
  if (m === 'delete' && path.startsWith('/posts/')) return { message:'Deleted' }

  // Platforms
  if (m === 'get'  && path === '/platforms')       return platforms
  if (m === 'post' && path === '/platforms/connect') return { ...platforms[0], id:'new_pl', name: data?.name || 'facebook', isConnected:true, accountName:'Demo Account', followers: Math.floor(Math.random()*20000+5000) }
  if (m === 'post' && path.includes('/disconnect')) return { message:'Disconnected' }
  if (m === 'post' && path.includes('/sync'))      return { message:'Synced 30 days of analytics data' }

  // Subscriptions
  if (m === 'get' && path === '/subscriptions/plans')
    return { free:{name:'Free',price:0,features:['10 posts/month','2 accounts','Basic analytics']}, pro:{name:'Pro',price:29,features:['Unlimited posts','5 accounts','AI generation','2 ad accounts']}, business:{name:'Business',price:79,features:['Everything in Pro','Unlimited accounts','Video generation','Team collaboration']} }
  if (m === 'get' && path === '/subscriptions/current')
    return { plan:'pro', status:'active', currentPeriodEnd: new Date(today.getTime()+30*86400000).toISOString(), planDetails:{ name:'Pro', price:29 } }
  if (m === 'post' && path === '/subscriptions/upgrade')
    return { plan: data?.plan || 'pro', status:'active', mockMode:true }

  // Ad Accounts
  if (m === 'get'  && path === '/ads/accounts')    return adAccounts
  if (m === 'post' && path === '/ads/accounts/connect') return { ...adAccounts[0], id:'new_'+Date.now(), platform: data?.platform || 'facebook', isConnected:true, accountName: data?.accountName || 'Demo Ad Account', totalBudget:1000, spentBudget:0 }
  if (m === 'get'  && path.includes('/stats'))     return { impressions:154000, clicks:5236, ctr:3.4, spend:294 }

  // Ad Campaigns
  if (m === 'get'  && path === '/ads/campaigns')   return adCampaigns
  if (m === 'post' && path === '/ads/campaigns')   return { ...data, id:'new_'+Date.now(), status:'draft', impressions:0, clicks:0, conversions:0, spend:0, createdAt:new Date().toISOString() }
  if (m === 'post' && path.includes('/launch'))    return { status:'active', impressions:Math.floor(Math.random()*5000+1000), clicks:Math.floor(Math.random()*200+50), spend:Math.floor(Math.random()*100+20) }
  if (m === 'post' && path.includes('/pause'))     return { status:'paused' }
  if (m === 'post' && path === '/ads/ai-copy')     return { headline:`${data?.product || 'Your Product'} — Try It Free Today`, body:`Join thousands of businesses using ${data?.product || 'our platform'} to ${data?.objective || 'grow their reach'}. Start your free trial now.`, callToAction:'Get Started Free' }

  // AI
  if (m === 'post' && path === '/ai/story')
    return { text: `✨ ${data?.topic ? `Here's the latest on ${data.topic}` : 'Big news'}!\n\nWe're thrilled to share something exciting with you today. Our team has been working hard behind the scenes, and we can't wait for you to experience what's coming next.\n\nStay tuned — the best is yet to come! 🚀\n\n${data?.brand ? `— ${data.brand}` : ''}`, hashtags:['#trending','#innovation','#socialmedia','#growth','#marketing'] }
  if (m === 'post' && path === '/ai/image')
    return { imageUrl: `https://picsum.photos/seed/${encodeURIComponent(data?.prompt||'demo')}/1024/1024`, isMock:true }
  if (m === 'post' && path === '/ai/video-script')
    return { script:`[HOOK - 0-3s]\nGrab attention immediately with a bold statement about ${data?.topic || 'your topic'}.\n\n[MAIN CONTENT - 3-${parseInt(data?.duration||30)-5}s]\nDive deep into the core message. Show, don't just tell. Use visuals that reinforce your key points about ${data?.topic || 'the subject'}.\n\n[CTA - last 5s]\nTell viewers exactly what to do next. Make it simple and compelling.`, scenes:[{time:'0:00-0:03',description:'Hook shot — close-up product/face',voiceover:`Did you know that ${data?.topic || 'this'} can change everything?`},{time:'0:03-0:20',description:'Main content with B-roll footage',voiceover:'Here\'s exactly how it works and why it matters for you.'},{time:'0:20-0:30',description:'CTA with contact info overlay',voiceover:'Click the link below to get started today — completely free.'}] }
  if (m === 'post' && path === '/ai/edit')
    return { editedContent: (data?.content || '') + '\n\n[✨ AI-enhanced: improved clarity, engagement, and flow]' }
  if (m === 'get'  && path === '/ai/history')      return aiHistory
  if (m === 'post' && path === '/ai/use-in-post')  return { message:'Post created from generation' }

  // Fallback
  return { message:'Demo mode — mock response', data:[] }
}
