/**
 * localStorage 数据管理层
 * 统一管理所有数据的读写操作
 */
const Storage = {
    KEYS: {
        WORDS: 'kaoyan_words',
        KNOWLEDGE: 'kaoyan_knowledge',
        WRONG_BOOK: 'kaoyan_wrongbook',
        USED_MATH: 'kaoyan_used_math'
    },

    // ========== 单词 ==========
    getWords() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.WORDS)) || [];
        } catch { return []; }
    },
    addWord(word, meaning) {
        const words = this.getWords();
        // 去重
        if (words.find(w => w.word.toLowerCase() === word.toLowerCase())) return false;
        words.push({ word, meaning, addedAt: Date.now() });
        localStorage.setItem(this.KEYS.WORDS, JSON.stringify(words));
        return true;
    },
    removeWord(index) {
        const words = this.getWords();
        words.splice(index, 1);
        localStorage.setItem(this.KEYS.WORDS, JSON.stringify(words));
    },
    clearWords() {
        localStorage.setItem(this.KEYS.WORDS, '[]');
    },

    // ========== 知识点 ==========
    getKnowledge() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.KNOWLEDGE)) || [];
        } catch { return []; }
    },
    addKnowledge(text) {
        const items = this.getKnowledge();
        if (items.find(k => k.text === text)) return false;
        items.push({ text, addedAt: Date.now() });
        localStorage.setItem(this.KEYS.KNOWLEDGE, JSON.stringify(items));
        return true;
    },
    removeKnowledge(index) {
        const items = this.getKnowledge();
        items.splice(index, 1);
        localStorage.setItem(this.KEYS.KNOWLEDGE, JSON.stringify(items));
    },
    clearKnowledge() {
        localStorage.setItem(this.KEYS.KNOWLEDGE, '[]');
    },

    // ========== 错题本 ==========
    getWrongBook() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.WRONG_BOOK)) || [];
        } catch { return []; }
    },
    addWrongItem(item) {
        const items = this.getWrongBook();
        items.push({
            ...item,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.KEYS.WRONG_BOOK, JSON.stringify(items));
    },
    removeWrongItem(id) {
        let items = this.getWrongBook();
        items = items.filter(i => i.id !== id);
        localStorage.setItem(this.KEYS.WRONG_BOOK, JSON.stringify(items));
    },
    clearWrongBook() {
        localStorage.setItem(this.KEYS.WRONG_BOOK, '[]');
    },

    // ========== 已出数学题目（去重用） ==========
    getUsedMathQuestions() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.USED_MATH)) || [];
        } catch { return []; }
    },
    addUsedMathQuestion(stem) {
        const items = this.getUsedMathQuestions();
        if (items.includes(stem)) return false;
        items.push(stem);
        localStorage.setItem(this.KEYS.USED_MATH, JSON.stringify(items));
        return true;
    },
    clearUsedMathQuestions() {
        localStorage.setItem(this.KEYS.USED_MATH, '[]');
    }
};
