/**
 * 错题本模块
 * - 展示所有错题
 * - 支持查看详情和重新作答
 */
const WrongBookModule = (() => {
    let currentRedoItem = null;
    let viewMode = 'time'; // 'time' | 'theorem'
    let uploadedFiles = [];

    function renderWrongItem(item) {
        return `
            <div class="wrong-item" data-id="${item.id}">
                <div class="wrong-header">
                    <span class="wrong-tag">${item.type === 'choice' ? '选择题' : '填空题'}</span>
                    <span class="wrong-date">${formatDate(item.createdAt)}</span>
                </div>
                <div class="wrong-question">${item.stem}</div>
                <div class="wrong-info">
                    <span>你的答案：<strong style="color:#dc2626;">${escapeHtml(String(item.userAnswer))}</strong></span>
                    <span>正确答案：<strong style="color:#059669;">${escapeHtml(String(item.correctAnswer))}</strong></span>
                </div>
                ${item.tags && item.tags.length > 0 ? `<div class="wrong-tags">${item.tags.map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                <div style="font-size:13px;color:#64748b;margin-top:4px;">${item.explanation || ''}</div>
                <button class="redo-btn" data-id="${item.id}">重新作答</button>
                <button class="btn btn-sm btn-outline" data-del="${item.id}" style="margin-left:6px;">删除</button>
            </div>
        `;
    }

    function bindItemEvents(container, items) {
        container.querySelectorAll('.redo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const item = items.find(i => i.id === id);
                if (item) showRedo(item);
            });
        });
        container.querySelectorAll('[data-del]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.del);
                Storage.removeWrongItem(id);
                renderList();
                document.getElementById('wrong-count').textContent = Storage.getWrongBook().length;
                document.getElementById('redo-area').classList.add('hidden');
            });
        });
    }

    function renderGroupedList() {
        const items = Storage.getWrongBook();
        const listEl = document.getElementById('wrongbook-list');
        document.getElementById('wrong-count').textContent = items.length;

        if (items.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无错题，继续加油！</p>';
            return;
        }

        const theoremGroups = {};
        const untagged = [];

        items.forEach(item => {
            if (item.tags && item.tags.length > 0) {
                item.tags.forEach(tag => {
                    if (!theoremGroups[tag]) theoremGroups[tag] = [];
                    theoremGroups[tag].push(item);
                });
            } else {
                untagged.push(item);
            }
        });

        const sortedTheorems = Object.keys(theoremGroups).sort((a, b) =>
            theoremGroups[b].length - theoremGroups[a].length
        );

        let html = '';
        sortedTheorems.forEach(theorem => {
            const group = theoremGroups[theorem];
            html += `
                <div class="theorem-group">
                    <div class="theorem-header">
                        <span class="theorem-name">${escapeHtml(theorem)}</span>
                        <span class="theorem-count">${group.length} 题</span>
                    </div>
                    ${group.map(item => renderWrongItem(item)).join('')}
                </div>
            `;
        });

        if (untagged.length > 0) {
            html += `
                <div class="theorem-group">
                    <div class="theorem-header">
                        <span class="theorem-name">未分类</span>
                        <span class="theorem-count">${untagged.length} 题</span>
                    </div>
                    ${untagged.map(item => renderWrongItem(item)).join('')}
                </div>
            `;
        }

        listEl.innerHTML = html;
        bindItemEvents(listEl, items);
    }

    function renderTimeList() {
        const items = Storage.getWrongBook();
        const listEl = document.getElementById('wrongbook-list');
        document.getElementById('wrong-count').textContent = items.length;

        if (items.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无错题，继续加油！</p>';
            return;
        }

        listEl.innerHTML = items.map(item => renderWrongItem(item)).join('');
        bindItemEvents(listEl, items);
    }

    function renderList() {
        if (viewMode === 'theorem') {
            renderGroupedList();
        } else {
            renderTimeList();
        }
    }

    function showRedo(item) {
        currentRedoItem = item;
        const areaEl = document.getElementById('redo-area');
        const contentEl = document.getElementById('redo-content');
        areaEl.classList.remove('hidden');

        if (item.type === 'choice') {
            contentEl.innerHTML = `
                <div class="quiz-question">
                    <div class="q-header">错题重做 · 选择题</div>
                    <div class="q-stem">${item.stem}</div>
                    <div class="quiz-options">
                        ${item.choices.map((c, ci) => `
                            <label class="quiz-option" data-choice="${ci}">
                                <input type="radio" name="redo_q" value="${ci}">
                                <span>${String.fromCharCode(65+ci)}. ${c}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div id="redo-feedback" style="margin-top:8px;"></div>
                </div>
                <button id="btn-redo-submit" class="btn btn-primary">提交</button>
            `;
        } else {
            contentEl.innerHTML = `
                <div class="quiz-question">
                    <div class="q-header">错题重做 · 填空题</div>
                    <div class="q-stem">${item.stem}</div>
                    <input type="text" class="fill-input" id="redo-fill-input" placeholder="请输入答案">
                    <div id="redo-feedback" style="margin-top:8px;"></div>
                </div>
                <button id="btn-redo-submit" class="btn btn-primary">提交</button>
            `;
        }

        // 选择题点击
        contentEl.querySelectorAll('.quiz-option').forEach(opt => {
            opt.addEventListener('click', () => {
                contentEl.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });

        // 提交
        document.getElementById('btn-redo-submit').addEventListener('click', () => handleRedoSubmit(item));

        areaEl.scrollIntoView({ behavior: 'smooth' });
    }

    function handleRedoSubmit(item) {
        const feedbackEl = document.getElementById('redo-feedback');
        let userAnswer;

        if (item.type === 'choice') {
            const selected = document.querySelector('.quiz-option.selected');
            if (!selected) { alert('请选择一个选项'); return; }
            userAnswer = parseInt(selected.dataset.choice);
        } else {
            userAnswer = document.getElementById('redo-fill-input').value.trim();
            if (!userAnswer) { alert('请输入答案'); return; }
        }

        let isCorrect;
        if (item.type === 'choice') {
            // 需要知道正确答案的索引。从 item 中无法直接获取索引，这里用 correctAnswer 文本匹配
            const correctIdx = item.choices.findIndex(c => c === item.correctAnswer);
            isCorrect = (userAnswer === correctIdx);
        } else {
            const userAns = String(userAnswer).replace(/\s+/g, '').toLowerCase();
            const correctAns = String(item.correctAnswer).replace(/\s+/g, '').toLowerCase();
            isCorrect = (userAns === correctAns);
        }

        if (isCorrect) {
            feedbackEl.innerHTML = '<span class="feedback-correct">回答正确！已从错题本移除</span>';
            Storage.removeWrongItem(currentRedoItem.id);
            // 延迟刷新
            setTimeout(() => {
                renderList();
                document.getElementById('wrong-count').textContent = Storage.getWrongBook().length;
                document.getElementById('redo-area').classList.add('hidden');
            }, 1000);
        } else {
            feedbackEl.innerHTML = `<span class="feedback-wrong">回答错误。正确答案：${escapeHtml(String(item.correctAnswer))}</span>`;
            // 禁用提交按钮防止重复点击
            const submitBtn = document.getElementById('btn-redo-submit');
            submitBtn.textContent = '再试一次';
        }
    }

    function formatDate(isoStr) {
        try {
            const d = new Date(isoStr);
            const m = d.getMonth() + 1;
            const day = d.getDate();
            const h = d.getHours();
            const min = d.getMinutes();
            return `${m}月${day}日 ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
        } catch { return ''; }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========== 拍照上传 ==========
    function handleSelectImages() {
        document.getElementById('wrongbook-img-upload').click();
    }

    function handleFilesSelected(e) {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;

        const listEl = document.getElementById('wrongbook-upload-list');
        listEl.classList.remove('hidden');

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                uploadedFiles.push({
                    name: file.name,
                    path: file.path || file.name,
                    dataUrl: ev.target.result,
                    time: new Date().toLocaleString()
                });
                renderUploadList();
            };
            reader.readAsDataURL(file);
        });

        // 清空 input 以允许重复选择同一文件
        e.target.value = '';
    }

    function renderUploadList() {
        const listEl = document.getElementById('wrongbook-upload-list');
        listEl.innerHTML = uploadedFiles.map((f, i) => `
            <div class="upload-item">
                <img class="upload-preview" src="${f.dataUrl}" alt="${f.name}">
                <div class="upload-info">
                    <div class="upload-name">${escapeHtml(f.name)}</div>
                    <div class="upload-path">路径：${escapeHtml(f.path)}</div>
                    <div class="upload-time">${f.time}</div>
                </div>
                <span class="upload-status">等待识别</span>
            </div>
        `).join('');
    }

    // ========== 从 wrongbook.json 加载错题 ==========
    function loadWrongbookJson() {
        fetch('data/wrongbook.json', { cache: 'no-cache' })
            .then(res => res.json())
            .then(data => {
                if (!data.wrongQuestions || !Array.isArray(data.wrongQuestions)) return;

                const existingItems = Storage.getWrongBook();
                const existingStems = new Set(existingItems.map(it => (it.stem || '').trim()));

                let addedCount = 0;

                data.wrongQuestions.forEach(q => {
                    const stem = (q.stem || '').trim();
                    if (!stem || existingStems.has(stem)) return;

                    const item = {
                        id: Date.now() + addedCount,
                        stem: q.stem,
                        type: q.type || 'choice',
                        choices: q.options || q.choices || [],
                        correctAnswer: q.answer || q.correctAnswer || '',
                        userAnswer: q.userAnswer || '',
                        explanation: q.explanation || '',
                        tags: q.tags || [],
                        createdAt: q.createdAt || new Date().toISOString()
                    };
                    Storage.addWrongItem(item);
                    existingStems.add(stem);
                    addedCount++;
                });

                if (addedCount > 0) {
                    renderList();
                    document.getElementById('wrong-count').textContent =
                        Storage.getWrongBook().length;
                }
            })
            .catch(() => {
                // wrongbook.json 不存在时静默跳过
            });
    }

    function init() {
        // 从 wrongbook.json 加载错题并合并
        loadWrongbookJson();

        // 拍照上传按钮
        document.getElementById('btn-wrongbook-select-img')
            .addEventListener('click', handleSelectImages);
        document.getElementById('wrongbook-img-upload')
            .addEventListener('change', handleFilesSelected);

        // 视图切换按钮
        document.querySelectorAll('.wrongbook-toggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wrongbook-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                viewMode = btn.dataset.view;
                renderList();
            });
        });

        document.getElementById('btn-clear-wrong').addEventListener('click', () => {
            if (!confirm('确定清空所有错题？')) return;
            Storage.clearWrongBook();
            renderList();
            document.getElementById('wrong-count').textContent = '0';
            document.getElementById('redo-area').classList.add('hidden');
        });

        renderList();
    }

    return { init, renderList };
})();
