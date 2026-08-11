/**
 * 数学模块 (v4 — 考研数学二·真题/经典题题库)
 * - 70 道精选题目，覆盖数学二全范围
 * - 每道题标注来源（考研真题/武忠祥经典题/武忠祥每日一题/武忠祥基础题/考研真题改编）
 * - 支持按知识点关键词匹配出题 + 去重机制
 */
const MathModule = (() => {
    let currentQuiz = [];
    let recognition = null;
    let uploadedFiles = [];

    // ========== 题库（70 题 — 全部来自 new_questions.json） ==========
    const questionGenerators = {
        // ===== 极限与连续（L01-L10） =====
        L01: () => ({stem:'当 x→0 时，∫<sub>₀</sub><sup>x²</sup> (e^(t³)−1) dt 是 x⁷ 的（）',choices:['低阶无穷小','等价无穷小','高阶无穷小','同阶但非等价无穷小'],answer:2,type:'choice',tag:'考研真题 2021数二',explanation:''}),
        L02: () => ({stem:'lim<sub>x→0</sub> (tanx−x)/(x−sinx) =（）',choices:['0','1','2','3'],answer:2,type:'choice',tag:'武忠祥经典题',explanation:''}),
        L03: () => ({stem:'lim<sub>x→0</sub> (1+2x)^(1/sinx) =（）',choices:['e','e²','e³','1'],answer:1,type:'choice',tag:'武忠祥每日一题',explanation:''}),
        L04: () => ({stem:'函数 f(x)={ (eˣ−1)/x, x≠0; 1, x=0 } 在 x=0 处（）',choices:['连续且取极大值','连续且取极小值','可导且导数等于零','可导且导数不为零'],answer:1,type:'choice',tag:'考研真题 2021数二',explanation:''}),
        L05: () => ({stem:'当 x→0 时，α(x)=∫₀ˣ sint dt，β(x)=∫<sub>₀</sub><sup>sinx</sup> t dt，则 α(x) 是 β(x) 的（）',choices:['高阶无穷小','低阶无穷小','同阶无穷小','等价无穷小'],answer:1,type:'choice',tag:'武忠祥经典题',explanation:''}),
        L06: () => ({stem:'lim<sub>x→0</sub> (1−cosx·cos2x·cos3x)/(x²) = ',fillAnswer:'7',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        L07: () => ({stem:'设 a>0，lim<sub>x→0</sub> (aˣ−1)/x·∫₀ˣ ln(1+t²)dt = ',fillAnswer:'lna',type:'fill',tag:'武忠祥经典题',explanation:''}),
        L08: () => ({stem:'lim<sub>x→∞</sub> (x²+1)^(1/(lnx)) = ',fillAnswer:'e²',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        L09: () => ({stem:'设 lim<sub>x→0</sub> (ln(1+2x)+xf(x))/(x²)=2，则 lim<sub>x→0</sub> (2+f(x))/x =（）',choices:['0','1','2','3'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        L10: () => ({stem:'lim<sub>n→∞</sub> (1+1/n+1/n²)ⁿ = ',fillAnswer:'e',type:'fill',tag:'武忠祥经典题',explanation:''}),

        // ===== 导数与微分（D01-D10） =====
        D01: () => ({stem:'函数 f(x)=secx 在 x=0 处的 2 次泰勒多项式为 1+ax+bx²，则 a,b 分别为（）',choices:['a=1,b=−½','a=1,b=½','a=0,b=−½','a=0,b=½'],answer:3,type:'choice',tag:'考研真题 2021数二',explanation:''}),
        D02: () => ({stem:'设 y=ln(x+√(1+x²))，则 y\'\'(0)=（）',choices:['−1','0','1','2'],answer:1,type:'choice',tag:'武忠祥经典题',explanation:''}),
        D03: () => ({stem:'曲线 y=x³−3x 的拐点坐标是（）',choices:['(0,0)','(1,−2)','(−1,2)','不存在'],answer:0,type:'choice',tag:'武忠祥每日一题',explanation:''}),
        D04: () => ({stem:'设 f(x)=|x|sin|x|，则 f(x) 在 x=0 处（）',choices:['不连续','连续但不可导','可导但导数不连续','导数连续'],answer:2,type:'choice',tag:'武忠祥经典题',explanation:''}),
        D05: () => ({stem:'函数 f(x)=x³−3x²−9x+5 在 [−2,4] 上的最大值与最小值之差为（）',choices:['27','32','36','40'],answer:1,type:'choice',tag:'考研真题改编',explanation:''}),
        D06: () => ({stem:'设 f(x) 在 [0,1] 上连续，(0,1) 内可导，f(0)=0，f(1)=1，则存在 ξ∈(0,1) 使得 f\'(ξ)=（）',choices:['0','1','2','f(ξ)'],answer:1,type:'choice',tag:'武忠祥经典题',explanation:''}),
        D07: () => ({stem:'设 y=y(x) 由方程 e^y+xy=e 确定，则 y\'(0)= ',fillAnswer:'-1/e',type:'fill',tag:'考研真题改编',explanation:''}),
        D08: () => ({stem:'曲线 y=x²+lnx 在点 (1,1) 处的切线方程为 y= ',fillAnswer:'3x-2',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        D09: () => ({stem:'设 f(x)=e^(sinx)，则 f\'\'\'(0)= ',fillAnswer:'1',type:'fill',tag:'武忠祥经典题',explanation:''}),
        D10: () => ({stem:'已知函数 f(x) 满足 f\'(x)=f(x)+x，f(0)=0，则 f(1)=（）',choices:['e−2','e−1','e','2e−2'],answer:0,type:'choice',tag:'武忠祥每日一题',explanation:''}),

        // ===== 不定积分与定积分（I01-I10） =====
        I01: () => ({stem:'∫ x·eˣ dx =（）',choices:['xeˣ−eˣ+C','xeˣ+eˣ+C','eˣ(x−1)+C','(x+1)eˣ+C'],answer:0,type:'choice',tag:'武忠祥基础题',explanation:''}),
        I02: () => ({stem:'∫₀¹ x·ln(1+x) dx =（）',choices:['1/4','1/2','ln2−1/2','ln2/2'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        I03: () => ({stem:'反常积分 ∫<sub>₁</sub><sup>+∞</sup> 1/(x·ln²x) dx 的值是（）',choices:['1','发散','1/ln2','ln2'],answer:2,type:'choice',tag:'武忠祥经典题',explanation:''}),
        I04: () => ({stem:'设 F(x)=∫₀ˣ sin(t²) dt，则 F\'(√π)=（）',choices:['0','1','−1','√π'],answer:0,type:'choice',tag:'武忠祥每日一题',explanation:''}),
        I05: () => ({stem:'∫ dx/(x²+2x+5) = ',fillAnswer:'(1/2)arctan((x+1)/2)+C',type:'fill',tag:'考研真题改编',explanation:''}),
        I06: () => ({stem:'∫₀^π x·sinx dx = ',fillAnswer:'π',type:'fill',tag:'武忠祥经典题',explanation:''}),
        I07: () => ({stem:'∫ sec³x dx = ',fillAnswer:'(1/2)(secx·tanx+ln|secx+tanx|)+C',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        I08: () => ({stem:'∫₀¹ dx/√(x(1−x)) = ',fillAnswer:'π',type:'fill',tag:'考研真题改编',explanation:''}),
        I09: () => ({stem:'设 f(x) 连续，∫<sub>₀</sub><sup>x²</sup> f(t)dt = x²(1+x)，则 f(1)=（）',choices:['1','2','3','4'],answer:2,type:'choice',tag:'武忠祥经典题',explanation:''}),
        I10: () => ({stem:'∫<sub>₀</sub><sup>π/2</sup> ln(sinx) dx = ',fillAnswer:'-(π/2)ln2',type:'fill',tag:'武忠祥经典题',explanation:''}),

        // ===== 微分方程（O01-O08） =====
        O01: () => ({stem:'微分方程 y\'−2y = eˣ 的通解为 y=（）',choices:['Ce²ˣ−eˣ','Ce²ˣ+eˣ','Ceˣ+eˣ','Ceˣ−eˣ'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        O02: () => ({stem:'方程 y\'\'−3y\'+2y=0 的通解是 y=（）',choices:['C₁eˣ+C₂e²ˣ','C₁e²ˣ+C₂e³ˣ','C₁eˣ+C₂e³ˣ','(C₁+C₂x)eˣ'],answer:0,type:'choice',tag:'武忠祥经典题',explanation:''}),
        O03: () => ({stem:'微分方程 xy\'+y=0 满足 y(1)=1 的特解为（）',choices:['y=1/x','y=x','y=lnx','y=eˣ⁻¹'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        O04: () => ({stem:'方程 y\'\'+4y=0 的通解为 y=（）',choices:['C₁cos2x+C₂sin2x','C₁cosx+C₂sinx','C₁e²ˣ+C₂e⁻²ˣ','C₁e^(2x)cosx+C₂e^(2x)sinx'],answer:0,type:'choice',tag:'武忠祥基础题',explanation:''}),
        O05: () => ({stem:'微分方程 y\'−y/x = x² 的通解为 y=（）',choices:['x³/2+Cx','x³/3+Cx','x³/2+C/x','x²+Cx'],answer:0,type:'choice',tag:'武忠祥每日一题',explanation:''}),
        O06: () => ({stem:'方程 y\'\'−y=0 满足 y(0)=2, y\'(0)=1 的特解为 y= ',fillAnswer:'(3/2)eˣ+(1/2)e⁻ˣ',type:'fill',tag:'考研真题改编',explanation:''}),
        O07: () => ({stem:'方程 xy\'−y=x³ 的通解为 y= ',fillAnswer:'x³/2+Cx',type:'fill',tag:'武忠祥经典题',explanation:''}),
        O08: () => ({stem:'方程 y\'\'+y\'−2y=eˣ 的一个特解形式可设为 y*= ',fillAnswer:'Axeˣ',type:'fill',tag:'武忠祥每日一题',explanation:''}),

        // ===== 多元微分学（P01-P08） =====
        P01: () => ({stem:'设 z=ln(x²+y²)，则 ∂z/∂x|(1,1) =（）',choices:['1','1/2','2','0'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        P02: () => ({stem:'函数 f(x,y)=x²+y²−2x−4y 的极小值点为（）',choices:['(1,2)','(2,1)','(0,0)','(2,2)'],answer:0,type:'choice',tag:'武忠祥经典题',explanation:''}),
        P03: () => ({stem:'设 z=e^(xy)，则 ∂²z/(∂x∂y)|(0,0)=（）',choices:['0','1','e','−1'],answer:1,type:'choice',tag:'武忠祥每日一题',explanation:''}),
        P04: () => ({stem:'设 z=f(x²+y²)，f 可微，则 y(∂z/∂x)−x(∂z/∂y)=（）',choices:['0','2xy','x²+y²','2(x²+y²)'],answer:0,type:'choice',tag:'考研真题 2021数二改编',explanation:''}),
        P05: () => ({stem:'函数 u=ln(x²+y²+z²) 在点 (1,1,1) 处的梯度方向导数的最大值为 ',fillAnswer:'√3',type:'fill',tag:'武忠祥经典题',explanation:''}),
        P06: () => ({stem:'设 z=xʸ，则 dz|(1,1) = ',fillAnswer:'dx',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        P07: () => ({stem:'曲面 z=x²+y² 在点 (1,1,2) 处的切平面方程为 z= ',fillAnswer:'2x+2y-2',type:'fill',tag:'考研真题改编',explanation:''}),
        P08: () => ({stem:'设方程 xy+yz+zx=1 确定隐函数 z=z(x,y)，则 ∂z/∂x|(0,1,1)= ',fillAnswer:'-2',type:'fill',tag:'武忠祥经典题',explanation:''}),

        // ===== 矩阵与行列式（M01-M10） =====
        M01: () => ({stem:'行列式 |1 2 3; 2 3 1; 3 1 2| =（）',choices:['−18','0','18','36'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        M02: () => ({stem:'设 A 为 3 阶方阵，|A|=2，则 |2A⁻¹|=（）',choices:['1','2','4','8'],answer:2,type:'choice',tag:'武忠祥经典题',explanation:''}),
        M03: () => ({stem:'设 A=(1 2; 2 1)，则 A⁻¹=（）',choices:['(−1/3 2/3; 2/3 −1/3)','(1/3 −2/3; −2/3 1/3)','(1 2; 2 1)','(−1/3 −2/3; −2/3 −1/3)'],answer:0,type:'choice',tag:'武忠祥基础题',explanation:''}),
        M04: () => ({stem:'设矩阵 A 满足 A²−A−2E=O，则 A 可逆且 A⁻¹=（）',choices:['A−E','(A−E)/2','(A−E)/3','E−A'],answer:1,type:'choice',tag:'考研真题改编',explanation:''}),
        M05: () => ({stem:'设 A 为 n 阶正交矩阵，则下列错误的是（）',choices:['|A|=±1','A 的行向量为单位向量','A 的列向量两两正交','A 的转置等于 A'],answer:3,type:'choice',tag:'武忠祥经典题',explanation:''}),
        M06: () => ({stem:'设 A=(1 0; 2 3)，则 A^(−1) 的 (2,1) 元素为 ',fillAnswer:'-2/3',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        M07: () => ({stem:'设 |A|=1，且 A 的伴随矩阵 A* 满足 A*A=2E，则 |A|= ',fillAnswer:'4',type:'fill',tag:'考研真题改编',explanation:''}),
        M08: () => ({stem:'已知矩阵 A=(1 2 3; 0 1 2; 0 0 1)，则 A 的秩为 ',fillAnswer:'3',type:'fill',tag:'武忠祥基础题',explanation:''}),
        M09: () => ({stem:'设 A 是 3×2 矩阵，B 是 2×3 矩阵，则 AB 的秩最大为 ',fillAnswer:'2',type:'fill',tag:'武忠祥经典题',explanation:''}),
        M10: () => ({stem:'若 n 阶矩阵 A 满足 A²=A，则 A 的特征值只能是 ',fillAnswer:'0或1',type:'fill',tag:'考研真题改编',explanation:''}),

        // ===== 向量组与线性方程组（V01-V08） =====
        V01: () => ({stem:'向量组 α₁=(1,1,0), α₂=(1,0,1), α₃=(0,1,1) 的秩为（）',choices:['1','2','3','0'],answer:2,type:'choice',tag:'武忠祥基础题',explanation:''}),
        V02: () => ({stem:'设 α₁,α₂,α₃ 线性无关，则 α₁+α₂, α₂+α₃, α₃+α₁（）',choices:['线性无关','线性相关','部分无关','无法判定'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        V03: () => ({stem:'齐次方程组 Ax=0 有非零解的充要条件是（）',choices:['A 可逆','|A|=0','A 的秩等于列数','A 的行数小于列数'],answer:1,type:'choice',tag:'武忠祥经典题',explanation:''}),
        V04: () => ({stem:'设 A 是 m×n 矩阵，Ax=0 只有零解，则（）',choices:['m≥n','A 的行向量线性无关','A 的列向量线性无关','r(A)＜n'],answer:2,type:'choice',tag:'考研真题改编',explanation:''}),
        V05: () => ({stem:'非齐次方程组 Ax=b 有解的充要条件是（）',choices:['|A|≠0','r(A)=r(A,b)','r(A)=n','A 可逆'],answer:1,type:'choice',tag:'武忠祥经典题',explanation:''}),
        V06: () => ({stem:'向量组 α₁=(1,2,3), α₂=(2,4,6), α₃=(1,1,1) 的秩为 ',fillAnswer:'2',type:'fill',tag:'武忠祥基础题',explanation:''}),
        V07: () => ({stem:'若三维向量组 α₁=(1,1,0), α₂=(0,1,1), α₃=(-1,0,-1)，则 α₁,α₂,α₃ 的一个极大无关组含 ',fillAnswer:'2',type:'fill',tag:'考研真题改编',explanation:''}),
        V08: () => ({stem:'方程组 {x₁+x₂=0; x₁−x₂=0} 的基础解系含向量的个数为 ',fillAnswer:'0',type:'fill',tag:'武忠祥经典题',explanation:''}),

        // ===== 特征值与二次型（E01-E06） =====
        E01: () => ({stem:'矩阵 A=(1 2; 2 1) 的特征值为（）',choices:['1,1','3,−1','2,0','1,3'],answer:1,type:'choice',tag:'考研真题改编',explanation:''}),
        E02: () => ({stem:'实对称矩阵 A 的不同特征值对应的特征向量必（）',choices:['线性相关','正交','相等','反号'],answer:1,type:'choice',tag:'武忠祥经典题',explanation:''}),
        E03: () => ({stem:'设 A 是 n 阶实对称矩阵，则 A 可相似对角化的条件是（）',choices:['任何情况都可以','A 特征值全为正','|A|≠0','A 满秩'],answer:0,type:'choice',tag:'考研真题改编',explanation:''}),
        E04: () => ({stem:'矩阵 A=(0 1; −1 0) 的特征值为 ',fillAnswer:'i, -i',type:'fill',tag:'武忠祥每日一题',explanation:''}),
        E05: () => ({stem:'已知 3 阶矩阵 A 的特征值为 1,2,3，则 |A−E|= ',fillAnswer:'0',type:'fill',tag:'考研真题改编',explanation:''}),
        E06: () => ({stem:'二次型 f(x₁,x₂)=2x₁²+2x₁x₂+2x₂² 的矩阵为 ',fillAnswer:'(2,1;1,2)',type:'fill',tag:'武忠祥经典题',explanation:''}),
    };

    // 关键词 → 生成器映射
    const keywordMap = [
        { keys: ['极限', 'limit', '夹逼', '无穷小', '无穷大', '等价', '连续', '间断', '洛必达', '泰勒', '函数', '收敛', '数列'],
          gens: ['L01','L02','L03','L04','L05','L06','L07','L08','L09','L10'] },
        { keys: ['导数', '微分', '切线', '法线', 'derivative', '求导', '隐函数', '高阶导数', '中值定理', '极值', '单调', '拐点', '凹凸', '渐近线', '曲率'],
          gens: ['D01','D02','D03','D04','D05','D06','D07','D08','D09','D10'] },
        { keys: ['积分', '不定积分', '定积分', '反常积分', 'integral', '换元', '分部积分', '原函数', '面积', '体积', '弧长', '旋转体'],
          gens: ['I01','I02','I03','I04','I05','I06','I07','I08','I09','I10'] },
        { keys: ['微分方程', 'differential', '通解', '特解', '特征方程', '初值'],
          gens: ['O01','O02','O03','O04','O05','O06','O07','O08'] },
        { keys: ['多元', '偏导数', '全微分', '偏导', '多元函数', '梯度', '切平面', '方向导数', '极值点', '驻点', '隐函数'],
          gens: ['P01','P02','P03','P04','P05','P06','P07','P08'] },
        { keys: ['矩阵', '行列式', 'det', '逆矩阵', '秩', '正交矩阵', '伴随矩阵', '可逆', '正交', '转置'],
          gens: ['M01','M02','M03','M04','M05','M06','M07','M08','M09','M10'] },
        { keys: ['向量', '线性相关', '线性无关', '基础解系', '齐次', '非齐次', '方程组', '极大无关组', '解空间', '维数'],
          gens: ['V01','V02','V03','V04','V05','V06','V07','V08'] },
        { keys: ['特征值', '特征向量', '二次型', '相似', '对角化', '实对称', '正定', '标准型', '合同'],
          gens: ['E01','E02','E03','E04','E05','E06'] },
    ];

    function generateQuestions(count, type) {
        const knowledge = Storage.getKnowledge();
        const usedStems = new Set(Storage.getUsedMathQuestions());
        const questions = [];

        // 匹配关键词
        // 无知识点 → 返回空
        if (knowledge.length === 0) return [];

        const matchedGens = [];
        knowledge.forEach(k => {
            keywordMap.forEach(mapping => {
                if (mapping.keys.some(keyword => k.text.includes(keyword))) {
                    matchedGens.push(...mapping.gens);
                }
            });
        });

        // 无匹配方向 → 返回空（不再回退全题库）
        let poolGens = [...new Set(matchedGens)];
        if (poolGens.length === 0) return [];

        // 按题型过滤
        let typedGens = poolGens;
        if (type !== 'all') {
            typedGens = poolGens.filter(name => questionGenerators[name]().type === type);
            if (typedGens.length === 0) typedGens = poolGens;
        }

        const MAX_ATTEMPTS = 80;
        for (let i = 0; i < count; i++) {
            let q = null;
            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                const genName = typedGens[Math.floor(Math.random() * typedGens.length)];
                const candidate = questionGenerators[genName]();
                if (!usedStems.has(candidate.stem)) {
                    q = candidate;
                    usedStems.add(candidate.stem);
                    Storage.addUsedMathQuestion(candidate.stem);
                    break;
                }
            }
            if (!q) break;
            q.id = i;
            q.userAnswer = null;
            q.isCorrect = null;
            questions.push(q);
        }
        return questions;
    }

    // ========== UI 渲染 ==========
    function renderKnowledgeList() {
        const items = Storage.getKnowledge();
        const listEl = document.getElementById('knowledge-list');
        const countEl = document.getElementById('knowledge-count');
        countEl.textContent = items.length;
        if (items.length === 0) {
            listEl.innerHTML = '<li style="text-align:center;color:#94a3b8;padding:16px;">还没有录入知识点</li>';
            return;
        }
        listEl.innerHTML = items.map((k, i) => `
            <li>
                <span>${escapeHtml(k.text)}</span>
                <button class="del-btn" data-index="${i}">&times;</button>
            </li>
        `).join('');
        listEl.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Storage.removeKnowledge(parseInt(btn.dataset.index));
                renderKnowledgeList();
            });
        });
    }

    function renderQuiz(questions) {
        const areaEl = document.getElementById('quiz-area');
        areaEl.classList.remove('hidden');
        document.getElementById('quiz-result').classList.add('hidden');

        areaEl.innerHTML = questions.map((q, i) => {
            const tagHtml = q.tag ? `<span class="question-tag">${escapeHtml(q.tag)}</span>` : '';
            if (q.type === 'choice') {
                return `
                <div class="quiz-question" data-id="${q.id}">
                    <div class="q-header">第 ${i+1} 题 · 选择题 ${tagHtml}</div>
                    <div class="q-stem">${q.stem}</div>
                    <div class="quiz-options">
                        ${q.choices.map((c, ci) => `
                            <label class="quiz-option" data-qid="${q.id}" data-choice="${ci}">
                                <input type="radio" name="q${q.id}" value="${ci}">
                                <span>${String.fromCharCode(65+ci)}. ${c}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>`;
            } else {
                return `
                <div class="quiz-question" data-id="${q.id}">
                    <div class="q-header">第 ${i+1} 题 · 填空题 ${tagHtml}</div>
                    <div class="q-stem">${q.stem}</div>
                    <input type="text" class="fill-input" data-qid="${q.id}" placeholder="请输入答案">
                </div>`;
            }
        }).join('') + `<div class="quiz-submit-row"><button id="btn-submit-quiz" class="btn btn-primary">提交答案</button></div>`;

        areaEl.querySelectorAll('.quiz-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const qid = parseInt(opt.dataset.qid);
                const choice = parseInt(opt.dataset.choice);
                const q = currentQuiz.find(x => x.id === qid);
                if (q.isCorrect !== null) return;
                q.userAnswer = choice;
                areaEl.querySelectorAll(`.quiz-option[data-qid="${qid}"]`).forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
        document.getElementById('btn-submit-quiz').addEventListener('click', handleSubmit);
    }

    // ========== 错题定理标注 ==========
    function tagQuestion(stem) {
        const tags = new Set();
        const s = stem;
        // 极限类
        if (/lim|洛必达/.test(s)) tags.add('洛必达法则');
        if (/夹逼/.test(s)) tags.add('夹逼准则');
        if (/等价|同阶/.test(s)) tags.add('等价无穷小');
        if (/泰勒|麦克劳林/.test(s)) tags.add('泰勒展开');
        if (/\(1\+[^)]+\)\s*\^\s*[1n∞]|lim.*=.*\be\b/.test(s)) tags.add('重要极限');
        if (/单调.*有界|有界.*单调/.test(s)) tags.add('单调有界');
        if (/无穷小/.test(s) && !/等价/.test(s)) tags.add('无穷小比较');
        if (/连续|间断/.test(s)) tags.add('连续性');
        // 导数类
        if (/求导|导数|微分|切线|法线|曲率|f'/.test(s)) tags.add('求导法则');
        if (/链式|复合/.test(s)) tags.add('链式法则');
        if (/隐函数|由方程.*确定/.test(s)) tags.add('隐函数求导');
        if (/中值定理|罗尔|拉格朗日|ξ/.test(s)) tags.add('中值定理');
        if (/单调/.test(s) && !/单调有界/.test(s) && !/单调性/.test(s)) {
            const hasDerivative = /f'|导数|y'/.test(s);
            if (hasDerivative) tags.add('单调性判定');
        }
        if (/极值|极大|极小|最大|最小|驻点/.test(s)) tags.add('极值判定');
        if (/凹凸/.test(s)) tags.add('凹凸性');
        if (/拐点/.test(s)) tags.add('拐点');
        // 积分类
        if (/换元|∫.*√/.test(s)) tags.add('换元积分法');
        if (/分部积分|∫.*·|x·e|∫.*sin/.test(s)) tags.add('分部积分法');
        if (/定积分|反常积分|∫₀/.test(s) && !/分部|换元/.test(s)) tags.add('牛顿莱布尼茨公式');
        if (/反常积分|发散/.test(s)) tags.add('反常积分审敛法');
        if (/面积|体积|旋转体|弧长/.test(s)) tags.add('定积分几何应用');
        // 微分方程
        if (/可分离|分离变量/.test(s)) tags.add('可分离变量');
        if (/一阶.*线性|y'.*y/.test(s) && !/y''/.test(s)) tags.add('一阶线性');
        if (/y''/.test(s) && !/偏导|∂/.test(s)) tags.add('二阶常系数');
        if (/特征方程|特征根/.test(s)) tags.add('特征方程法');
        if (/常数变易|变易法/.test(s)) tags.add('常数变易法');
        // 多元微分
        if (/偏导|∂z|∂/.test(s)) tags.add('偏导数计算');
        if (/全微分|dz\b/.test(s)) tags.add('全微分');
        if (/条件极值|拉格朗日乘数/.test(s)) tags.add('条件极值');
        if (/无条件极值|极值点|驻点/.test(s) && /z\s*=/.test(s)) tags.add('无条件极值');
        if (/梯度|切平面|方向导数/.test(s)) {
            tags.add('偏导数计算');
        }
        // 线代
        if (/行列式/.test(s)) tags.add('行列式计算');
        if (/逆矩阵|可逆|正交矩阵|转置|A⁻¹/.test(s)) tags.add('矩阵运算');
        if (/伴随/.test(s)) tags.add('伴随矩阵');
        if (/\b秩\b|r\(A\)/.test(s)) tags.add('秩');
        if (/特征值|特征向量/.test(s) && !/特征方程/.test(s)) tags.add('特征值与特征向量');
        if (/二次型|标准型|正定|合同/.test(s)) tags.add('二次型');
        if (/相似|对角化/.test(s)) tags.add('相似对角化');
        return [...tags];
    }

    function handleSubmit() {
        let allAnswered = true;
        const unanswered = [];
        currentQuiz.forEach(q => {
            if (q.type === 'choice' && q.userAnswer === null) {
                allAnswered = false; unanswered.push(q.id + 1);
            } else if (q.type === 'fill') {
                const input = document.querySelector(`.fill-input[data-qid="${q.id}"]`);
                if (input) {
                    q.userAnswer = input.value.trim();
                    if (!q.userAnswer) { allAnswered = false; unanswered.push(q.id + 1); }
                }
            }
        });
        if (!allAnswered) { alert(`请完成以下题目：第 ${unanswered.join(', ')} 题`); return; }

        let correctCount = 0;
        currentQuiz.forEach(q => {
            if (q.type === 'choice') {
                q.isCorrect = (q.userAnswer === q.answer);
            } else {
                const userAns = q.userAnswer.replace(/\s+/g, '').toLowerCase();
                const correctAns = q.fillAnswer.replace(/\s+/g, '').toLowerCase();
                q.isCorrect = (userAns === correctAns);
            }
            if (q.isCorrect) correctCount++;
            else {
                Storage.addWrongItem({
                    subject: '数学', topic: '练习', stem: q.stem, type: q.type,
                    choices: q.choices || null,
                    correctAnswer: q.type === 'choice' ? q.choices[q.answer] : q.fillAnswer,
                    userAnswer: q.type === 'choice' ? q.choices[q.userAnswer] : q.userAnswer,
                    explanation: q.explanation,
                    tags: tagQuestion(q.stem)
                });
            }
        });

        showResult(correctCount, currentQuiz.length);

        currentQuiz.forEach(q => {
            const questionEl = document.querySelector(`.quiz-question[data-id="${q.id}"]`);
            if (!questionEl) return;
            if (q.type === 'choice') {
                questionEl.querySelectorAll('.quiz-option').forEach(opt => {
                    const ci = parseInt(opt.dataset.choice);
                    if (ci === q.answer) opt.classList.add('correct');
                    if (ci === q.userAnswer && !q.isCorrect) opt.classList.add('wrong');
                    opt.style.pointerEvents = 'none';
                });
            } else {
                const input = questionEl.querySelector('.fill-input');
                if (input) {
                    input.disabled = true;
                    input.style.borderColor = q.isCorrect ? '#86efac' : '#fca5a5';
                }
                const feedback = document.createElement('div');
                feedback.className = q.isCorrect ? 'feedback-correct' : 'feedback-wrong';
                feedback.style.marginTop = '6px'; feedback.style.fontSize = '13px';
                feedback.innerHTML = q.isCorrect ? '回答正确' : `回答错误，正确答案：${q.fillAnswer}`;
                questionEl.appendChild(feedback);
            }
        });

        document.getElementById('wrong-count').textContent = Storage.getWrongBook().length;
        document.getElementById('btn-submit-quiz').style.display = 'none';
    }

    function showResult(correct, total) {
        const resultEl = document.getElementById('quiz-result');
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
            <div>本次练习成绩</div>
            <div class="score">${correct} / ${total}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">
                ${correct === total ? '全部正确，太棒了！' : `做错 ${total - correct} 题，已自动收录到错题本`}
            </div>
        `;
    }

    // ========== 智能分段 ==========
    function handleSmartSplit() {
        const input = document.getElementById('math-knowledge-input');
        const text = input.value.trim();
        if (!text) { alert('请先输入知识点文本'); return; }
        const rawSegments = text.split(/[。！？；\n]+/).map(s => s.trim()).filter(s => s.length > 0);
        if (rawSegments.length === 0) { alert('未能识别有效分段，请检查文本格式'); return; }
        const uniqueSegments = [...new Set(rawSegments)];
        renderSplitPreview(uniqueSegments);
    }

    function renderSplitPreview(segments) {
        const preview = document.getElementById('split-preview');
        const list = document.getElementById('split-list');
        const count = document.getElementById('split-count');
        count.textContent = segments.length;
        list.innerHTML = segments.map((s, i) => `
            <li data-index="${i}">
                <span class="split-item-text">${escapeHtml(s)}</span>
                <button class="split-item-del">&times;</button>
            </li>
        `).join('');
        list.querySelectorAll('.split-item-del').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const li = btn.closest('li');
                li.remove();
                const remaining = list.querySelectorAll('li');
                count.textContent = remaining.length;
                if (remaining.length === 0) {
                    preview.classList.add('hidden');
                }
            });
        });
        preview.classList.remove('hidden');
    }

    function confirmSplit() {
        const preview = document.getElementById('split-preview');
        const items = document.querySelectorAll('#split-list li .split-item-text');
        if (items.length === 0) { preview.classList.add('hidden'); return; }
        let added = 0, skipped = 0;
        items.forEach(item => {
            const text = item.textContent.trim();
            if (!text) return;
            if (Storage.addKnowledge(text)) added++;
            else skipped++;
        });
        preview.classList.add('hidden');
        document.getElementById('math-knowledge-input').value = '';
        renderKnowledgeList();
        if (skipped > 0) {
            alert(`已添加 ${added} 条${skipped > 0 ? `，${skipped} 条重复已跳过` : ''}`);
        }
    }

    function cancelSplit() {
        document.getElementById('split-preview').classList.add('hidden');
    }

    // ========== 语音输入 ==========
    function handleVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert('您的浏览器不支持语音识别，请使用 Chrome 浏览器'); return; }
        const statusEl = document.getElementById('voice-status');
        statusEl.classList.remove('hidden'); statusEl.textContent = '正在聆听...请说出知识点';
        recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN'; recognition.interimResults = false;
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            document.getElementById('math-knowledge-input').value = text;
            statusEl.textContent = `识别结果：${text}`;
            setTimeout(() => statusEl.classList.add('hidden'), 2000);
        };
        recognition.onerror = (event) => {
            statusEl.textContent = `语音识别出错：${event.error}`;
            setTimeout(() => statusEl.classList.add('hidden'), 3000);
        };
        recognition.onend = () => {
            if (statusEl.textContent === '正在聆听...请说出知识点') {
                statusEl.textContent = '未检测到语音，请重试';
                setTimeout(() => statusEl.classList.add('hidden'), 2000);
            }
        };
        recognition.start();
    }

    // ========== 拍照上传 ==========
    function handleSelectImages() { document.getElementById('img-upload').click(); }
    function handleFilesSelected(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedFiles.push({ name: file.name, path: file.path || file.name, dataUrl: e.target.result, time: new Date().toLocaleString() });
                renderUploadList();
            };
            reader.readAsDataURL(file);
        });
        event.target.value = '';
    }
    function renderUploadList() {
        const listEl = document.getElementById('upload-list');
        if (uploadedFiles.length === 0) { listEl.classList.add('hidden'); return; }
        listEl.classList.remove('hidden');
        listEl.innerHTML = uploadedFiles.map(f => `
            <div class="upload-item">
                <img class="upload-preview" src="${escapeHtml(f.dataUrl)}" alt="${escapeHtml(f.name)}">
                <div class="upload-info">
                    <div class="upload-name">${escapeHtml(f.name)}</div>
                    <div class="upload-path">${escapeHtml(f.path)}</div>
                </div>
                <span class="upload-status">等待识别</span>
            </div>
        `).join('');
    }

    function loadKnowledgeJson() {
        fetch('data/knowledge.json')
            .then(res => { if (!res.ok) return null; return res.json(); })
            .then(data => {
                if (!data || !Array.isArray(data.knowledge)) return;
                const existing = Storage.getKnowledge();
                const existingTexts = new Set(existing.map(k => k.text));
                let added = 0;
                data.knowledge.forEach(item => { if (item && item.text && !existingTexts.has(item.text)) { Storage.addKnowledge(item.text); added++; } });
                if (added > 0) renderKnowledgeList();
            }).catch(() => {});
    }

    function migrateV4() {
        const MIGRATED_KEY = 'kaoyan_math_v4_migrated';
        if (!localStorage.getItem(MIGRATED_KEY)) {
            Storage.clearUsedMathQuestions();
            localStorage.setItem(MIGRATED_KEY, '1');
        }
    }

    // ========== 事件绑定 ==========
    function init() {
        migrateV4();

        document.getElementById('btn-add-knowledge').addEventListener('click', () => {
            const input = document.getElementById('math-knowledge-input');
            const text = input.value.trim();
            if (!text) { alert('请输入知识点'); return; }
            if (text.length > 200) { alert('知识点内容过长，请精简'); return; }
            const ok = Storage.addKnowledge(text);
            if (!ok) { alert('该知识点已存在'); return; }
            input.value = ''; renderKnowledgeList(); input.focus();
        });
        document.getElementById('btn-voice-input').addEventListener('click', handleVoiceInput);
        document.getElementById('btn-smart-split').addEventListener('click', handleSmartSplit);
        document.getElementById('btn-confirm-split').addEventListener('click', confirmSplit);
        document.getElementById('btn-cancel-split').addEventListener('click', cancelSplit);
        document.getElementById('btn-clear-knowledge').addEventListener('click', () => {
            if (!confirm('确定清空所有知识点？')) return;
            Storage.clearKnowledge(); renderKnowledgeList();
        });
        document.getElementById('btn-generate-quiz').addEventListener('click', () => {
            const type = document.getElementById('question-type').value;
            const count = parseInt(document.getElementById('question-count').value);
            currentQuiz = generateQuestions(count, type);
            if (currentQuiz.length === 0) {
                const knowledge = Storage.getKnowledge();
                alert(knowledge.length === 0 ? '请先录入知识点' : '当前知识点未匹配到题库方向，请录入极限/导数/积分等关键词');
                return;
            }
            renderQuiz(currentQuiz);
        });
        document.getElementById('btn-select-img').addEventListener('click', handleSelectImages);
        document.getElementById('img-upload').addEventListener('change', handleFilesSelected);
        loadKnowledgeJson();
        renderKnowledgeList();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, renderKnowledgeList };
})();
