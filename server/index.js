import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Route for the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});


// --- Platform Fetchers ---

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    },
    timeout: 10000 // 10 second timeout
};

const fetchLeetCode = async (username) => {
    try {
        const query = {
            query: `
                query userProfile($username: String!) {
                    matchedUser(username: $username) {
                        profile {
                            ranking
                        }
                        submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                    recentSubmissionList(username: $username, limit: 5) {
                        title
                        statusDisplay
                        time
                    }
                }
            `,
            variables: { username }
        };

        const res = await axios.post('https://leetcode.com/graphql', query, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://leetcode.com/'
            },
            timeout: 10000
        });

        const data = res.data.data.matchedUser;
        const recentSubmissions = res.data.data.recentSubmissionList || [];
        
        if (!data) throw new Error('User not found on LeetCode');

        const acStats = data.submitStatsGlobal.acSubmissionNum;
        const totalStats = data.submitStatsGlobal.totalSubmissionNum;
        
        const solved = acStats.find(s => s.difficulty === 'All').count;
        const easy = acStats.find(s => s.difficulty === 'Easy').count;
        const medium = acStats.find(s => s.difficulty === 'Medium').count;
        const hard = acStats.find(s => s.difficulty === 'Hard').count;

        const totalAttempts = totalStats.find(s => s.difficulty === 'All').submissions;
        const acAttempts = acStats.find(s => s.difficulty === 'All').submissions;
        const acceptanceRate = totalAttempts > 0 ? ((acAttempts / totalAttempts) * 100).toFixed(1) : 0;

        return {
            solved: solved,
            rank: data.profile.ranking || 'Unknown',
            easy: easy,
            medium: medium,
            hard: hard,
            acceptanceRate: `${acceptanceRate}%`,
            recentSubmissions: recentSubmissions.map(s => ({
                title: s.title,
                status: s.statusDisplay,
                time: s.time
            }))
        };
    } catch (error) {
        console.error(`LeetCode Error [${username}]:`, error.response?.data || error.message);
        return null;
    }
};

const fetchCodeforces = async (username) => {
    try {
        const infoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
        const statusUrl = `https://codeforces.com/api/user.status?handle=${username}&from=1&count=5`;
        const ratingUrl = `https://codeforces.com/api/user.rating?handle=${username}`;

        const [infoRes, statusRes, ratingRes] = await Promise.all([
            axios.get(infoUrl, axiosConfig),
            axios.get(statusUrl, axiosConfig),
            axios.get(ratingUrl, axiosConfig)
        ]);

        if (infoRes.data.status !== 'OK') throw new Error(infoRes.data.comment);

        const user = infoRes.data.result[0];
        const recentSubmissions = (statusRes.data.result || []).map(sub => ({
            name: sub.problem.name,
            verdict: sub.verdict
        }));
        const ratingHistory = (ratingRes.data.result || []).slice(-5).map(r => ({
            contest: r.contestName,
            rating: r.newRating
        }));

        return {
            rating: user.rating || 0,
            rank: user.rank || 'Unrated',
            maxRating: user.maxRating || 0,
            maxRank: user.maxRank || 'Unrated',
            recentSubmissions,
            ratingHistory
        };
    } catch (error) {
        console.error(`Codeforces Error [${username}]:`, error.response?.data || error.message);
        return null;
    }
};

const fetchCodeChef = async (username) => {
    try {
        const res = await axios.get(`https://www.codechef.com/users/${username}`, axiosConfig);
        const $ = cheerio.load(res.data);

        // 1. Basic Info
        const rating = $('.rating-number').first().text().trim() || '0';
        const stars = $('.rating-star').text().trim() || '1★';

        // 2. Ranks
        let globalRank = 'N/A';
        let countryRank = 'N/A';
        $('.rating-ranks li').each((i, el) => {
            const text = $(el).text().toLowerCase();
            const val = $(el).find('strong').text().trim();
            if (text.includes('global')) globalRank = val;
            else if (text.includes('country')) countryRank = val;
        });

        // 3. Solved Problems Count
        let solved = 0;
        const bodyText = $('body').text();
        const solvedMatch = bodyText.match(/Total Problems Solved:\s*(\d+)/i);
        if (solvedMatch) {
            solved = parseInt(solvedMatch[1]);
        } else {
            // Fallback to h3 search
            $('h3, h5').each((i, el) => {
                const text = $(el).text();
                if (text.includes('Total Problems Solved')) {
                    const match = text.match(/(\d+)/);
                    if (match) solved = parseInt(match[1]);
                }
            });
        }

        // 4. Learning Paths
        let courses = 0;
        const coursesMatch = bodyText.match(/Learning Paths\s*\((\d+)\)/i);
        if (coursesMatch) courses = parseInt(coursesMatch[1]);

        // 5. Difficulty Breakdown
        const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
        $('.rating-data-section.problems-solved h3, .rating-data-section.problems-solved h5').each((i, el) => {
            const hText = $(el).text();
            const match = hText.match(/^(.*?)\s*\((\d+)\)/);
            if (match) {
                let catName = match[1].toLowerCase();
                const count = parseInt(match[2]);
                if (catName.includes(':')) catName = catName.split(':').pop().trim();

                if (catName.includes('easy')) difficulty.Easy = count;
                else if (catName.includes('medium')) difficulty.Medium = count;
                else if (catName.includes('hard')) difficulty.Hard = count;
            }
        });

        return {
            rating: parseInt(rating) || 0,
            stars: stars,
            solved: solved,
            globalRank: globalRank,
            countryRank: countryRank,
            courses: courses,
            difficulty: difficulty
        };
    } catch (error) {
        console.error(`CodeChef Error [${username}]:`, error.response?.data || error.message);
        return null;
    }
};

const fetchGitHub = async (username) => {
    try {
        const [profileRes, reposRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}`, axiosConfig),
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, axiosConfig)
        ]);

        const profile = profileRes.data;
        const repos = reposRes.data || [];

        let totalStars = 0;
        repos.forEach(repo => {
            totalStars += (repo.stargazers_count || 0);
        });

        return {
            repos: profile.public_repos || 0,
            stars: totalStars,
            followers: profile.followers || 0,
            following: profile.following || 0,
            location: profile.location || 'N/A',
            company: profile.company || 'N/A'
        };
    } catch (error) {
        console.error(`GitHub Error [${username}]:`, error.response?.data || error.message);
        return null;
    }
};

const fetchHackerRank = async (username) => {
    try {
        const profileUrl = `https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`;
        const badgesUrl = `https://www.hackerrank.com/rest/hackers/${username}/badges`;

        const [profileRes, badgesRes] = await Promise.all([
            axios.get(profileUrl, axiosConfig),
            axios.get(badgesUrl, axiosConfig)
        ]);

        const profileData = profileRes.data.model;
        if (!profileData) throw new Error('User not found on HackerRank');

        const badgesModels = badgesRes.data.models || [];
        let totalSolved = 0;
        let badgesList = [];

        badgesModels.forEach(b => {
            if (b.stars > 0 || b.solved > 0) {
                totalSolved += (b.solved || 0);
                badgesList.push({
                    badge: b.badge_name,
                    stars: b.stars,
                    solved: b.solved
                });
            }
        });

        return {
            name: profileData.name || 'N/A',
            rank: profileData.personal_rank || 'N/A',
            followers: profileData.followers_count || 0,
            solved: totalSolved,
            badges: badgesList.length,
            stars: badgesList.reduce((acc, b) => acc + (b.stars || 0), 0) // Total stars across all badges
        };
    } catch (error) {
        console.error(`HackerRank Error [${username}]:`, error.response?.data || error.message);
        return null;
    }
};


// --- Endpoints ---

app.get('/api/stats/:platform/:username', async (req, res) => {
    const { platform, username } = req.params;
    let data = null;

    switch (platform.toLowerCase()) {
        case 'leetcode': data = await fetchLeetCode(username); break;
        case 'codeforces': data = await fetchCodeforces(username); break;
        case 'codechef': data = await fetchCodeChef(username); break;
        case 'github': data = await fetchGitHub(username); break;
        case 'hackerrank': data = await fetchHackerRank(username); break;
        default: return res.status(400).json({ error: 'Invalid platform' });
    }

    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'User not found or platform error' });
    }
});

// Bulk fetch for a student
app.post('/api/student-sync', async (req, res) => {
    const { handles } = req.body; // { leetcode: 'user', github: 'user', ... }
    const results = {};

    const promises = Object.entries(handles).map(async ([platform, username]) => {
        if (!username) return;
        let stats = null;
        switch (platform.toLowerCase()) {
            case 'leetcode': stats = await fetchLeetCode(username); break;
            case 'codeforces': stats = await fetchCodeforces(username); break;
            case 'codechef': stats = await fetchCodeChef(username); break;
            case 'github': stats = await fetchGitHub(username); break;
            case 'hackerrank': stats = await fetchHackerRank(username); break;
        }
        if (stats) results[platform] = stats;
    });

    await Promise.all(promises);

    // --- Dynamic behavioral Pattern Calculation ---
    // Simulating "real-time" behavioral analysis based on fetched platform data
    const calculateBehavior = () => {
        const lc = results.leetcode || {};
        const gh = results.github || {};
        const cf = results.codeforces || {};
        const hr = results.hackerrank || {};

        // 1. Leadership: derived from GitHub stars and impact
        const leadership = Math.min(60 + (gh.stars || 0) * 2 + (lc.rank === 'Pending' ? 0 : 5), 98);

        // 2. teamwork: derived from followers and contributions
        const teamwork = Math.min(65 + (gh.followers || 0) + (cf.recentSubmissions?.length || 0) * 2, 95);

        // 3. punctuality: derived from solve counts and recent activity
        const punctuality = Math.min(70 + (lc.solved ? Math.log10(lc.solved) * 10 : 0) + (cf.recentSubmissions?.length || 0), 99);

        // 4. Communication: derived from profile info and platform presence
        const communication = Math.min(60 + (hr.followers || 0) * 5 + (gh.location !== 'N/A' ? 10 : 0), 94);

        const score = Math.round((leadership + teamwork + punctuality + communication) / 4);

        return {
            behaviorScore: score,
            behaviorMetrics: {
                leadership: Math.round(leadership),
                teamwork: Math.round(teamwork),
                punctuality: Math.round(punctuality),
                communication: Math.round(communication)
            }
        };
    };

    if (Object.keys(results).length > 0) {
        results.behavior = calculateBehavior();
    }

    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
