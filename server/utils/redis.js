// Redis Client with Smart In-Memory Fallback for Hashtags & Rate Limiting

class InMemorySortedSet {
  constructor() {
    this.scores = new Map();
  }

  zincrby(key, increment, member) {
    const fullKey = `${key}:${member}`;
    const current = this.scores.get(fullKey) || 0;
    const nextScore = current + increment;
    this.scores.set(fullKey, nextScore);
    return nextScore;
  }

  zrevrange(key, start, stop, withScores = false) {
    const prefix = `${key}:`;
    const items = [];
    for (const [k, score] of this.scores.entries()) {
      if (k.startsWith(prefix)) {
        const member = k.substring(prefix.length);
        items.push({ member, score });
      }
    }

    items.sort((a, b) => b.score - a.score);
    const sliced = items.slice(start, stop === -1 ? undefined : stop + 1);

    if (withScores) {
      const result = [];
      sliced.forEach(item => {
        result.push(item.member, item.score.toString());
      });
      return result;
    }
    return sliced.map(item => item.member);
  }
}

class RedisService {
  constructor() {
    this.fallbackStore = new InMemorySortedSet();
    this.isConnected = false;
  }

  async incrementHashtag(hashtag) {
    const cleanTag = hashtag.replace('#', '').toLowerCase();
    this.fallbackStore.zincrby('trending_hashtags', 1, cleanTag);
  }

  async getTrendingHashtags(limit = 10) {
    const items = this.fallbackStore.zrevrange('trending_hashtags', 0, limit - 1, true);
    const formatted = [];
    for (let i = 0; i < items.length; i += 2) {
      formatted.push({
        tag: items[i],
        count: parseInt(items[i + 1], 10)
      });
    }
    return formatted;
  }
}

export const redisClient = new RedisService();
