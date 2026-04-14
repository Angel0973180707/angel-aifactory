const state = {
  currentView: 'dashboard',
  stories: [
    {
      story_id: 'S01',
      title: '我陶醉了：拆除情緒炸彈的幽默智慧',
      pain: '情緒爆炸、親子衝突、反應失控',
      summary: '孩子發脾氣時，大人穩住自己，孩子用幽默語言化解尷尬。',
      insight: '大人先穩，孩子才回得來；幽默與連結比怒氣更有效。',
      topic: '情緒教養',
      priority: 1,
      status: '未生成',
      toolCode: 'EQ-01 / MIX-02',
      keywords: '情緒拆彈,共同調節,幽默感,鏡像神經元',
      original: '孩子一路發牢騷，姑姑不跟著爆，最後孩子自己用一句「我陶醉了」下台階。'
    },
    {
      story_id: 'S02',
      title: '勇於負責：為什麼自己泡的奶最香？',
      pain: '依賴、不負責、選擇困難',
      summary: '孩子自己動手後更願意承擔後果，也更有成就感。',
      insight: '自主會喚醒責任感，決定權也是成長權。',
      topic: '自主成長',
      priority: 1,
      status: '未生成',
      toolCode: 'ACT-02 / ACT-01',
      keywords: '自主權,自我效能感,自然後果',
      original: '孩子自己泡奶、灑了奶粉，本來怕被罵，結果被鼓勵，從此更願意承擔。'
    },
    {
      story_id: 'S06',
      title: '幸福吸引力：如何讓幸福願意望向我們？',
      pain: '只看成績、忽略關係、幸福感低',
      summary: '把日常小事轉成感謝與擁抱，建立正向情感循環。',
      insight: '幸福感來自有感與回應，貼心會長出價值感。',
      topic: '親子關係',
      priority: 2,
      status: '未生成',
      toolCode: 'EQ-03 / MAIN-01',
      keywords: '催產素,感恩教育,善循環,親子連結',
      original: '從孩子一句貼心回應，延伸出如何吸引幸福、培養感恩的對話。'
    }
  ],
  videos: [],
  publish: []
};

const viewConfig = {
  dashboard: ['Dashboard', '今日內容狀態總覽'],
  'story-pool': ['Story Pool', '挑故事、勾選、送生成'],
  'video-factory': ['Video Factory', '查看長片與 Shorts 生成結果'],
  'publish-factory': ['Publish Factory', '生成發佈文案與 CTA']
};

function init() {
  bindNav();
  bindActions();
  renderFilters();
  renderAll();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function bindActions() {
  document.getElementById('refresh-btn').addEventListener('click', renderAll);
  document.getElementById('mock-generate-btn').addEventListener('click', generateForStories(state.stories.slice(0, 1).map(s => s.story_id)));
  document.getElementById('generate-selected-btn').addEventListener('click', () => {
    const ids = [...document.querySelectorAll('.story-check:checked')].map(el => el.value);
    generateForStories(ids)();
  });
  document.getElementById('generate-publish-mock').addEventListener('click', mockPublishGeneration);
  document.getElementById('send-to-publish-all').addEventListener('click', sendAllToPublish);
  document.getElementById('close-dialog').addEventListener('click', () => document.getElementById('story-detail-dialog').close());

  document.getElementById('filter-topic').addEventListener('change', renderStoryTable);
  document.getElementById('filter-priority').addEventListener('change', renderStoryTable);
}

function switchView(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === view));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  const [title, subtitle] = viewConfig[view];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;
}

function renderAll() {
  renderStats();
  renderTodo();
  renderRecentGenerated();
  renderStoryTable();
  renderVideoFactory();
  renderPublishFactory();
}

function renderFilters() {
  const topics = [...new Set(state.stories.map(s => s.topic))];
  const select = document.getElementById('filter-topic');
  select.innerHTML = '<option value="all">全部主題群</option>' + topics.map(t => `<option value="${t}">${t}</option>`).join('');
}

function renderStats() {
  const stats = [
    { label: '待生成故事', value: state.stories.filter(s => s.status === '未生成').length },
    { label: '已生成內容', value: state.videos.length },
    { label: '待發布內容', value: state.publish.filter(p => p.status !== '已發布').length },
    { label: '已串工具內容', value: state.videos.filter(v => !!v.tool_integration).length }
  ];
  document.getElementById('stats-grid').innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
    </div>`).join('');
}

function renderTodo() {
  const items = [
    '先從 Story Pool 選 1 則故事測試生成。',
    '確認 Video Factory 內 3 支長片與 Shorts 是否結構正確。',
    '把要發的內容送到 Publish Factory。',
    '下一步再接試算表 API 與 Gemini。'
  ];
  document.getElementById('todo-list').innerHTML = items.map(i => `<div class="todo-item">${i}</div>`).join('');
}

function renderRecentGenerated() {
  const list = state.videos.slice(-3).reverse();
  document.getElementById('recent-generated').innerHTML = list.length ? list.map(v => `
    <div class="recent-item">
      <strong>${v.story_id}</strong>｜${v.title}<br>
      <span class="muted">${v.angle_type} / ${v.content_type}</span>
    </div>`).join('') : '<div class="muted">尚未生成內容</div>';
}

function getFilteredStories() {
  const topic = document.getElementById('filter-topic').value;
  const priority = document.getElementById('filter-priority').value;
  return state.stories.filter(s => (topic === 'all' || s.topic === topic) && (priority === 'all' || String(s.priority) === priority));
}

function renderStoryTable() {
  const rows = getFilteredStories().map(s => `
    <tr>
      <td><input class="story-check" type="checkbox" value="${s.story_id}"></td>
      <td>${s.story_id}</td>
      <td><strong>${s.title}</strong></td>
      <td>${s.pain}</td>
      <td>${s.topic}</td>
      <td>${s.priority}</td>
      <td>${s.toolCode}</td>
      <td>${s.status}</td>
      <td><button class="btn btn-secondary btn-sm" onclick="openStoryDetail('${s.story_id}')">查看</button></td>
    </tr>`).join('');
  document.getElementById('story-table-body').innerHTML = rows;
}

window.openStoryDetail = function(storyId) {
  const story = state.stories.find(s => s.story_id === storyId);
  document.getElementById('dialog-title').textContent = `${story.story_id}｜${story.title}`;
  document.getElementById('dialog-content').innerHTML = `
    <p><strong>核心情境摘要：</strong>${story.summary}</p>
    <p><strong>核心痛點：</strong>${story.pain}</p>
    <p><strong>核心領悟：</strong>${story.insight}</p>
    <p><strong>關鍵字：</strong>${story.keywords}</p>
    <p><strong>工具：</strong>${story.toolCode}</p>
    <p><strong>故事原文摘要：</strong>${story.original}</p>
    <div class="code-box">// TODO: 這裡之後可顯示完整故事原文
// TODO: 從試算表 STORY_POOL 讀取</div>
  `;
  document.getElementById('story-detail-dialog').showModal();
}

function generateForStories(ids) {
  return () => {
    if (!ids.length) {
      alert('請先勾選故事');
      return;
    }

    ids.forEach(id => {
      const story = state.stories.find(s => s.story_id === id);
      story.status = '已生成';

      const longAngles = ['心靈感悟', '心腦科學', '教養故事'];
      longAngles.forEach(angle => {
        state.videos.push({
          factory_id: `${id}-${angle}-long`,
          story_id: id,
          title: `${story.title}｜${angle}版`,
          angle_type: angle,
          content_type: 'long',
          hook: buildHook(story, angle),
          script: buildScript(story, angle),
          tool_integration: `如果你也卡在「${story.pain.split('、')[0]}」，可以接 ${story.toolCode}`
        });
      });

      ['情緒鉤子', '故事片段', '金句反轉'].forEach((type, i) => {
        for (let n = 1; n <= 2; n++) {
          state.videos.push({
            factory_id: `${id}-${type}-${n}`,
            story_id: id,
            title: `${story.title}｜${type}${n}`,
            angle_type: type,
            content_type: 'shorts',
            hook: `${buildShortHook(story, type)} A${n}`,
            content: `${story.summary} ${story.insight}`,
            ending: '完整故事與方法在長影片，工具我放在下方。',
            tool_integration: `${story.toolCode}`
          });
        }
      });
    });

    renderAll();
    switchView('video-factory');
  }
}

function buildHook(story, angle) {
  const map = {
    '心靈感悟': `你有沒有發現，很多親子衝突其實不是孩子的問題，而是大人的心先亂了？`,
    '心腦科學': `當孩子情緒爆炸時，大腦裡到底發生了什麼？`,
    '教養故事': `那一天，一句話，竟然讓整個情緒現場瞬間轉向。`
  };
  return map[angle] || `${story.title} 的 ${angle} 鉤子`;
}

function buildScript(story, angle) {
  return [
    `【開頭鉤子】${buildHook(story, angle)}`,
    `【情境】${story.summary}`,
    `【衝突】${story.pain}`,
    `【理解】${angle === '心腦科學' ? '加入前額葉 / 杏仁核 / 鏡像神經元說明。' : story.insight}`,
    `【轉化】把原本的控制，改成支持與連結。`,
    `【結尾】${story.toolCode} 可作為下一步工具。`
  ].join('\n\n');
}

function buildShortHook(story, type) {
  const map = {
    '情緒鉤子': `你是不是也有過這種瞬間快爆掉的時候？`,
    '故事片段': `那天現場，只因一句話，氣氛整個變了。`,
    '金句反轉': `教養的關鍵，不是控制孩子，而是穩住自己。`
  };
  return map[type] || story.title;
}

function groupVideosByStory() {
  const grouped = {};
  state.videos.forEach(v => {
    if (!grouped[v.story_id]) grouped[v.story_id] = [];
    grouped[v.story_id].push(v);
  });
  return grouped;
}

function renderVideoFactory() {
  const grouped = groupVideosByStory();
  const html = Object.entries(grouped).map(([storyId, items]) => {
    const story = state.stories.find(s => s.story_id === storyId);
    const longs = items.filter(i => i.content_type === 'long');
    const shorts = items.filter(i => i.content_type === 'shorts');

    return `
      <div class="video-card">
        <div class="video-head">
          <div>
            <h3>${storyId}｜${story.title}</h3>
            <div class="badges">
              <span class="badge">${story.topic}</span>
              <span class="badge">工具：${story.toolCode}</span>
              <span class="badge">優先級 ${story.priority}</span>
            </div>
          </div>
          <div class="inline-actions">
            <button class="btn btn-secondary" onclick="sendStoryToPublish('${storyId}')">送去發布</button>
          </div>
        </div>
        <div class="subgrid">
          <div>
            <h4>長影片（3支）</h4>
            <div class="long-grid">
              ${longs.map(l => `
                <div class="mini-card">
                  <h5>${l.angle_type}</h5>
                  <p><strong>Hook：</strong>${l.hook}</p>
                  <details>
                    <summary>查看腳本</summary>
                    <p class="muted">${l.script.replace(/\n/g, '<br>')}</p>
                  </details>
                </div>`).join('')}
            </div>
          </div>
          <div>
            <h4>Shorts（示意 6 支）</h4>
            <div class="short-grid">
              ${shorts.map(s => `
                <div class="mini-card">
                  <h5>${s.angle_type}</h5>
                  <p><strong>開頭：</strong>${s.hook}</p>
                  <p><strong>內容：</strong>${s.content}</p>
                  <p><strong>結尾：</strong>${s.ending}</p>
                </div>`).join('')}
            </div>
          </div>
          <div class="mini-card">
            <h5>工具導流</h5>
            <p>${longs[0]?.tool_integration || story.toolCode}</p>
            <div class="code-box">// TODO: 下一版改成從 TOOL_MAP 自動帶入 CTA</div>
          </div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('video-factory-list').innerHTML = html || '<div class="muted">尚未生成內容。請先到 Story Pool 勾選故事並生成。</div>';
}

window.sendStoryToPublish = function(storyId) {
  const exists = state.publish.some(p => p.story_id === storyId);
  if (!exists) {
    const story = state.stories.find(s => s.story_id === storyId);
    state.publish.push({
      publish_id: `PUB-${storyId}`,
      story_id: storyId,
      title1: `${story.title}｜很多父母忽略的關鍵`,
      title2: `${story.title}｜教養不是控制，是連結`,
      title3: `${story.title}｜你以為在管，其實在推遠`,
      description: `這支影片從故事出發，拆解${story.pain}背後的關係與理解。`,
      hashtags: '#親子教養 #情緒教養 #幸福教養 #腦科學',
      cta: `完整方法在長影片，工具 ${story.toolCode} 我也放在下方。`,
      status: '待發布'
    });
  }
  renderAll();
  switchView('publish-factory');
}

function sendAllToPublish() {
  [...new Set(state.videos.map(v => v.story_id))].forEach(id => window.sendStoryToPublish(id));
}

function mockPublishGeneration() {
  if (!state.videos.length) {
    alert('請先生成內容');
    return;
  }
  sendAllToPublish();
}

function renderPublishFactory() {
  document.getElementById('publish-list').innerHTML = state.publish.length ? state.publish.map(p => `
    <div class="publish-card">
      <div class="publish-head">
        <div>
          <h3>${p.story_id}</h3>
          <span class="badge">${p.status}</span>
        </div>
      </div>
      <div class="subgrid">
        <div class="mini-card">
          <h4>YouTube 標題</h4>
          <ol>
            <li>${p.title1}</li>
            <li>${p.title2}</li>
            <li>${p.title3}</li>
          </ol>
        </div>
        <div class="mini-card">
          <h4>描述 / CTA</h4>
          <p>${p.description}</p>
          <p><strong>CTA：</strong>${p.cta}</p>
        </div>
        <div class="mini-card">
          <h4>IG / Hashtags</h4>
          <p>${p.hashtags}</p>
        </div>
      </div>
    </div>`).join('') : '<div class="muted">尚未產生發布文案。</div>';
}

init();
