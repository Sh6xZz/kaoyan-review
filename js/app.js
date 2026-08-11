/**
 * 应用主入口
 * - Tab 切换
 * - 各模块初始化
 * - 错题数更新
 */
(function () {
    'use strict';

    // ========== Tab 切换 ==========
    function switchTab(tabName) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.toggle('active', section.id === `tab-${tabName}`);
        });

        // 切换到错题本时刷新列表
        if (tabName === 'wrongbook') {
            WrongBookModule.renderList();
            document.getElementById('wrong-count').textContent = Storage.getWrongBook().length;
        }
        // 切换到数学时刷新知识点列表
        if (tabName === 'math') {
            MathModule.renderKnowledgeList();
        }
        // 切换到英语时刷新单词列表
        if (tabName === 'english') {
            EnglishModule.renderWordList();
        }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // ========== 回车键快捷添加 ==========
    document.getElementById('eng-word').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('eng-meaning').focus();
    });
    document.getElementById('eng-meaning').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('btn-add-word').click();
    });
    document.getElementById('math-knowledge-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('btn-add-knowledge').click();
    });

    // ========== 初始化各模块 ==========
    EnglishModule.init();
    MathModule.init();
    WrongBookModule.init();

    // 初始化错题数量
    document.getElementById('wrong-count').textContent = Storage.getWrongBook().length;

    console.log('考研复习助手已就绪');
})();
