/* ==========================================================================
   A.M.F Web Editor - Javascript Logic (Form Management & File Export)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load initial config from LocalStorage (edited state) or window.BAND_CONFIG (original config)
  let currentConfig = null;
  const localData = localStorage.getItem('band_config_data');
  
  if (localData) {
    try {
      currentConfig = JSON.parse(localData);
    } catch (e) {
      console.error('LocalStorage config parse failed, falling back.', e);
    }
  }
  
  if (!currentConfig) {
    currentConfig = window.BAND_CONFIG;
  }

  // 2. Bind form populations
  populateGeneral(currentConfig);
  populateConcept(currentConfig);
  populateBiography(currentConfig);
  populateMembers(currentConfig);

  // 3. Setup event listeners
  setupListeners(currentConfig);
});

/**
   Populate General Inputs
 */
function populateGeneral(config) {
  document.getElementById('band-name-input').value = config.bandName || '';
  document.getElementById('tagline-input').value = config.tagline || '';
  document.getElementById('hero-image-input').value = config.heroImage || '';
  document.getElementById('spotify-embed-input').value = config.spotifyEmbedId || '';
  document.getElementById('spotify-playlist-url-input').value = config.spotifyPlaylistUrl || '';
  document.getElementById('youtube-playlist-url-input').value = config.youtubePlaylistUrl || '';
  document.getElementById('concept-subtitle-input').value = config.concept.subtitle || '';
  // Game images & musics loading (up to 5 slots)
  const gameImages = config.gameImages || [];
  const gameMusics = config.gameMusics || [];
  const gameMusicDetails = config.gameMusicDetails || [];
  for (let i = 0; i < 5; i++) {
    // 1. Image loading
    let imgVal = gameImages[i] || '';
    if (i === 0 && !imgVal && config.gameImage) {
      imgVal = config.gameImage; // Fallback to single gameImage
    }
    if (i === 0 && !imgVal) {
      imgVal = 'assets/space.png'; // Default fallback image for slot 1
    }
    document.getElementById(`game-image-input-${i}`).value = imgVal;
    document.getElementById(`game-image-preview-${i}`).src = imgVal || 'assets/space.png';

    // 2. Music loading
    const audioVal = gameMusics[i] || '';
    document.getElementById(`game-music-input-${i}`).value = audioVal;
    
    const statusLabel = document.getElementById(`game-music-status-${i}`);
    if (statusLabel) {
      if (audioVal) {
        // Calculate estimated size from Base64 string length
        const kbSize = Math.round((audioVal.length * 0.75) / 1024);
        statusLabel.textContent = `BGM: 登録済み (${kbSize} KB)`;
        statusLabel.style.color = '#10b981';
      } else {
        statusLabel.textContent = 'BGM: 未登録';
        statusLabel.style.color = 'var(--color-text-secondary)';
      }
    }

    // 3. Music details loading (credits)
    const detail = gameMusicDetails[i] || { title: '', titleLink: '', artist: '', artistLink: '' };
    document.getElementById(`game-music-title-${i}`).value = detail.title || '';
    document.getElementById(`game-music-title-link-${i}`).value = detail.titleLink || '';
    document.getElementById(`game-music-artist-${i}`).value = detail.artist || '';
    document.getElementById(`game-music-artist-link-${i}`).value = detail.artistLink || '';
  }

  // Load Hockey character configuration (up to 3 slots)
  const hockeyCharacters = config.hockeyCharacters || [];
  for (let i = 0; i < 3; i++) {
    const char = hockeyCharacters[i] || { name: '', difficulty: '1', image: '', music: '', musicDetail: { title: '', titleLink: '', artist: '', artistLink: '' } };
    document.getElementById(`hockey-name-${i}`).value = char.name || '';
    document.getElementById(`hockey-difficulty-${i}`).value = char.difficulty || '1';
    
    const imgVal = char.image || '';
    document.getElementById(`hockey-image-input-${i}`).value = imgVal;
    document.getElementById(`hockey-image-preview-${i}`).src = imgVal || 'assets/avatar.png';
    
    const audioVal = char.music || '';
    document.getElementById(`hockey-music-input-${i}`).value = audioVal;
    const statusLabel = document.getElementById(`hockey-music-status-${i}`);
    if (statusLabel) {
      if (audioVal) {
        const kbSize = Math.round((audioVal.length * 0.75) / 1024);
        statusLabel.textContent = `BGM: 登録済み (${kbSize} KB)`;
        statusLabel.style.color = '#10b981';
      } else {
        statusLabel.textContent = 'BGM: 未登録';
        statusLabel.style.color = 'var(--color-text-secondary)';
      }
    }
    
    const detail = char.musicDetail || { title: '', titleLink: '', artist: '', artistLink: '' };
    document.getElementById(`hockey-music-title-${i}`).value = detail.title || '';
    document.getElementById(`hockey-music-title-link-${i}`).value = detail.titleLink || '';
    document.getElementById(`hockey-music-artist-${i}`).value = detail.artist || '';
    document.getElementById(`hockey-music-artist-link-${i}`).value = detail.artistLink || '';
  }
}

/**
   Populate Concept Paragraph Textareas
 */
function populateConcept(config) {
  const container = document.getElementById('concept-paragraphs-container');
  container.innerHTML = '';
  
  const paragraphs = config.concept.description || [];
  paragraphs.forEach((pText, index) => {
    addConceptParagraphInput(pText, index);
  });
}

function addConceptParagraphInput(text = '', index = null) {
  const container = document.getElementById('concept-paragraphs-container');
  const div = document.createElement('div');
  div.className = 'form-group concept-p-item';
  div.style.position = 'relative';
  div.style.marginBottom = '12px';
  
  div.innerHTML = `
    <textarea class="form-control concept-paragraph-textarea" placeholder="段落を入力してください...">${text}</textarea>
    <button class="btn btn-danger btn-sm delete-paragraph-btn" style="position:absolute; right:10px; bottom:10px; padding: 4px 10px; font-size: 0.75rem;">削除</button>
  `;
  
  // Attach delete paragraph listener
  div.querySelector('.delete-paragraph-btn').addEventListener('click', () => {
    div.remove();
  });
  
  container.appendChild(div);
}

/**
   Populate Biography Timeline List
 */
function populateBiography(config) {
  const container = document.getElementById('timeline-container');
  container.innerHTML = '';
  
  const timeline = config.biography.timeline || [];
  timeline.forEach((event) => {
    addTimelineEventForm(event);
  });
}

function addTimelineEventForm(event = { year: '', title: '', description: '' }) {
  const container = document.getElementById('timeline-container');
  const div = document.createElement('div');
  div.className = 'timeline-item-form';
  
  div.innerHTML = `
    <button class="btn btn-danger btn-sm item-delete-btn delete-timeline-btn">削除</button>
    <div class="form-row">
      <div class="form-group">
        <label>年月 (表記)</label>
        <input type="text" class="form-control timeline-year" value="${event.year}" placeholder="例: 2025.08">
      </div>
      <div class="form-group">
        <label>イベント名 (タイトル)</label>
        <input type="text" class="form-control timeline-title" value="${event.title}" placeholder="例: チーム結成">
      </div>
    </div>
    <div class="form-group" style="margin-bottom:0;">
      <label>活動内容の説明</label>
      <textarea class="form-control timeline-description" placeholder="詳しい活動内容を入力してください...">${event.description}</textarea>
    </div>
  `;
  
  // Delete handler
  div.querySelector('.delete-timeline-btn').addEventListener('click', () => {
    div.remove();
  });
  
  container.appendChild(div);
}

/**
   Populate Members Directory List
 */
function populateMembers(config) {
  const container = document.getElementById('members-container');
  container.innerHTML = '';
  
  const members = config.members || [];
  members.forEach((member) => {
    addMemberForm(member);
  });
  
  updateMemberCount();
}

/**
   Helper function to update the active members count label
 */
function updateMemberCount() {
  const count = document.querySelectorAll('#members-container .member-item-form').length;
  const countBadge = document.getElementById('admin-member-count');
  if (countBadge) {
    countBadge.textContent = `現在の在籍人数: ${count}名`;
  }
}

function addMemberForm(member = { id: '', name: '', role: '', image: 'assets/avatar.png', bio: '', sns: { x: '', instagram: '', tiktok: '', youtube: '', spotify: '' }, embed: '' }) {
  const container = document.getElementById('members-container');
  const div = document.createElement('div');
  div.className = 'member-item-form collapsed';
  
  // Clean empty links fallback
  const sns = member.sns || { x: '', instagram: '', tiktok: '', youtube: '', spotify: '' };
  
  div.innerHTML = `
    <!-- Header (Always Visible) -->
    <div class="member-item-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <!-- Drag Handle -->
        <div class="drag-handle" style="cursor: grab; display: flex; align-items: center; color: var(--color-text-secondary); opacity: 0.4; transition: opacity 0.2s; padding: 4px;" title="ドラッグして順序を入れ替え">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none">
            <circle cx="9" cy="5" r="1.2"></circle>
            <circle cx="9" cy="12" r="1.2"></circle>
            <circle cx="9" cy="19" r="1.2"></circle>
            <circle cx="15" cy="5" r="1.2"></circle>
            <circle cx="15" cy="12" r="1.2"></circle>
            <circle cx="15" cy="19" r="1.2"></circle>
          </svg>
        </div>
        <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #000; flex-shrink: 0;">
          <img class="member-header-preview-img" src="${member.image}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 5px;">
          <span class="member-header-name" style="font-weight: 600; color: #fff; font-size: 0.95rem;">${member.name || '新規メンバー'}</span>
          <span class="member-header-role" style="font-size: 0.75rem; color: var(--color-text-secondary); opacity: 0.7;">[${member.role || '未設定'}]</span>
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <svg class="toggle-arrow" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" style="transition: transform 0.3s; transform: rotate(0deg); color: var(--color-text-secondary);">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    
    <!-- Body (Collapsible Content) -->
    <div class="member-item-body" style="display: none; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); position: relative;">
      <button class="btn btn-danger btn-sm item-delete-btn delete-member-btn" style="position: absolute; top: -10px; right: 0; padding: 4px 12px; font-size: 0.75rem;">このメンバーを削除</button>
      
      <div class="form-row">
        <div class="form-group">
          <label>メンバー名 (表示名)</label>
          <input type="text" class="form-control member-name" value="${member.name}" placeholder="例: AiMu">
        </div>
        <div class="form-group">
          <label>ID (一意の半角アルファベット)</label>
          <input type="text" class="form-control member-id" value="${member.id}" placeholder="例: aimu">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>役職／担当パート (肩書)</label>
          <input type="text" class="form-control member-role" value="${member.role}" placeholder="例: 代表、A.M.F Creator">
        </div>
        <div class="form-group">
          <label>プロフィール画像</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <div class="avatar-preview-box" style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0; background: #0a0a0f;">
              <img class="member-preview-img" src="${member.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <input type="file" class="form-control member-image-file" accept="image/*" style="padding: 6px 12px; font-size: 0.8rem; flex: 1;">
            <input type="hidden" class="member-image-path" value="${member.image}">
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label>自己紹介文</label>
        <textarea class="form-control member-bio" placeholder="自己紹介や簡単なプロフィールを記述してください...">${member.bio || ''}</textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>X (旧Twitter) リンク</label>
          <input type="text" class="form-control member-sns-x" value="${sns.x || ''}" placeholder="https://x.com/username">
        </div>
        <div class="form-group">
          <label>Instagram リンク</label>
          <input type="text" class="form-control member-sns-instagram" value="${sns.instagram || ''}" placeholder="https://instagram.com/username">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>TikTok リンク</label>
          <input type="text" class="form-control member-sns-tiktok" value="${sns.tiktok || ''}" placeholder="https://tiktok.com/@username">
        </div>
        <div class="form-group">
          <label>YouTube リンク</label>
          <input type="text" class="form-control member-sns-youtube" value="${sns.youtube || ''}" placeholder="https://youtube.com/@username">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Spotify リンク (アーティスト/個人)</label>
          <input type="text" class="form-control member-sns-spotify" value="${sns.spotify || ''}" placeholder="https://open.spotify.com/artist/... または track/...">
        </div>
        <div class="form-group">
          <!-- 空白 -->
        </div>
      </div>
      
      <div class="form-group" style="margin-bottom:0;">
        <label>プロフィール埋め込みコンテンツ (Spotifyプレイヤー / YouTube動画のiframeなど)</label>
        <textarea class="form-control member-embed" placeholder="例: <iframe ...></iframe>">${member.embed || ''}</textarea>
      </div>
    </div>
  `;
  
  // DOM element selections
  const header = div.querySelector('.member-item-header');
  const body = div.querySelector('.member-item-body');
  const arrow = div.querySelector('.toggle-arrow');
  
  const nameInput = div.querySelector('.member-name');
  const headerName = div.querySelector('.member-header-name');
  const roleInput = div.querySelector('.member-role');
  const headerRole = div.querySelector('.member-header-role');
  
  const fileInput = div.querySelector('.member-image-file');
  const previewImg = div.querySelector('.member-preview-img');
  const headerPreviewImg = div.querySelector('.member-header-preview-img');
  const hiddenPath = div.querySelector('.member-image-path');

  // Accordion Expand/Collapse Event
  header.addEventListener('click', (e) => {
    // Prevent toggle if clicking drag-handle
    if (e.target.closest('.drag-handle')) {
      return;
    }
    const isCollapsed = div.classList.contains('collapsed');
    if (isCollapsed) {
      div.classList.remove('collapsed');
      div.classList.add('expanded');
      body.style.display = 'block';
      arrow.style.transform = 'rotate(180deg)';
      div.style.background = 'rgba(255, 255, 255, 0.03)';
      div.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      div.style.padding = '25px';
    } else {
      div.classList.remove('expanded');
      div.classList.add('collapsed');
      body.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
      div.style.background = 'rgba(255, 255, 255, 0.01)';
      div.style.borderColor = 'rgba(255, 255, 255, 0.05)';
      div.style.padding = '15px 25px';
    }
  });

  // Real-time Text Bindings to Header
  nameInput.addEventListener('input', (e) => {
    headerName.textContent = e.target.value.trim() || '新規メンバー';
  });

  roleInput.addEventListener('input', (e) => {
    headerRole.textContent = e.target.value.trim() ? `[${e.target.value.trim()}]` : '[未設定]';
  });
  
  // File upload change listener
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        previewImg.src = dataUrl;
        headerPreviewImg.src = dataUrl; // Update header thumbnail too!
        hiddenPath.value = dataUrl;
      });
    }
  });

  // Drag and Drop Event Listeners
  div.setAttribute('draggable', 'true');
  
  div.addEventListener('dragstart', (e) => {
    // Only allow drag if initiated on drag-handle
    if (!e.target.closest('.drag-handle')) {
      e.preventDefault();
      return;
    }
    div.classList.add('dragging');
  });
  
  div.addEventListener('dragend', () => {
    div.classList.remove('dragging');
  });

  // Delete handler
  div.querySelector('.delete-member-btn').addEventListener('click', (e) => {
    e.stopPropagation(); // Stop click from bubbling to header (prevent toggle on delete)
    if (confirm(`${nameInput.value || '新規メンバー'} を削除してもよろしいですか？`)) {
      div.remove();
      updateMemberCount(); // Update count on delete
    }
  });
  
  container.appendChild(div);
  updateMemberCount(); // Update count on add
}

/**
   Helper function to crop and compress profile images
 */
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const max_size = 200; // Perfect size for circular avatars (approx 5-10KB in size)
      let width = img.width;
      let height = img.height;
      
      // Calculate crop coordinates for a perfect square crop
      let sx = 0;
      let sy = 0;
      let sWidth = img.width;
      let sHeight = img.height;
      
      if (width > height) {
        sx = (width - height) / 2;
        sWidth = height;
      } else {
        sy = (height - width) / 2;
        sHeight = width;
      }
      
      canvas.width = max_size;
      canvas.height = max_size;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, max_size, max_size);
      
      // Compress as JPEG (75% quality is crisp but extremely small)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      callback(dataUrl);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/**
   Helper function to crop and compress puzzle game images (500x500 square)
 */
function compressGameImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const max_size = 500; // Crisp size for puzzle pieces
      let width = img.width;
      let height = img.height;
      
      let sx = 0;
      let sy = 0;
      let sWidth = img.width;
      let sHeight = img.height;
      
      if (width > height) {
        sx = (width - height) / 2;
        sWidth = height;
      } else {
        sy = (height - width) / 2;
        sHeight = width;
      }
      
      canvas.width = max_size;
      canvas.height = max_size;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, max_size, max_size);
      
      // Compress as JPEG (80% quality is crisp but optimized)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      callback(dataUrl);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

/**
   Setup Form Actions and Event Listeners
 */
function setupListeners(config) {
  // Game image file upload listener (for all 5 slots)
  const gameImageInputs = document.querySelectorAll('.game-image-file');
  gameImageInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      const file = e.target.files[0];
      if (file) {
        compressGameImage(file, (dataUrl) => {
          document.getElementById(`game-image-preview-${idx}`).src = dataUrl;
          document.getElementById(`game-image-input-${idx}`).value = dataUrl;
        });
      }
    });
  });

  // Game music file upload listener (for all 5 slots)
  const gameMusicInputs = document.querySelectorAll('.game-music-file');
  gameMusicInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      const file = e.target.files[0];
      const statusLabel = document.getElementById(`game-music-status-${idx}`);
      
      if (file) {
        // Enforce 2MB size limit to protect localStorage capacity
        if (file.size > 2 * 1024 * 1024) {
          alert('ファイルサイズが大きすぎます (最大2MBまで)。\nブラウザの保存容量制限を回避するため、より短く軽量なMP3ファイルを選択してください。');
          e.target.value = ''; // Clear file input
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          const dataUrl = event.target.result;
          document.getElementById(`game-music-input-${idx}`).value = dataUrl;
          
          if (statusLabel) {
            const kbSize = Math.round((dataUrl.length * 0.75) / 1024);
            statusLabel.textContent = `BGM: 登録済み (${kbSize} KB)`;
            statusLabel.style.color = '#10b981';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // Hockey image file upload listener (for all 3 slots)
  const hockeyImageInputs = document.querySelectorAll('.hockey-image-file');
  hockeyImageInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      const file = e.target.files[0];
      if (file) {
        compressGameImage(file, (dataUrl) => {
          document.getElementById(`hockey-image-preview-${idx}`).src = dataUrl;
          document.getElementById(`hockey-image-input-${idx}`).value = dataUrl;
        });
      }
    });
  });

  // Hockey music file upload listener (for all 3 slots)
  const hockeyMusicInputs = document.querySelectorAll('.hockey-music-file');
  hockeyMusicInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      const file = e.target.files[0];
      const statusLabel = document.getElementById(`hockey-music-status-${idx}`);
      
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('ファイルサイズが大きすぎます (最大2MBまで)。\nブラウザの保存容量制限を回避するため、より短く軽量なMP3ファイルを選択してください。');
          e.target.value = '';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          const dataUrl = event.target.result;
          document.getElementById(`hockey-music-input-${idx}`).value = dataUrl;
          
          if (statusLabel) {
            const kbSize = Math.round((dataUrl.length * 0.75) / 1024);
            statusLabel.textContent = `BGM: 登録済み (${kbSize} KB)`;
            statusLabel.style.color = '#10b981';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // Add Concept Paragraph
  document.getElementById('add-paragraph-btn').addEventListener('click', () => {
    addConceptParagraphInput();
  });

  // Add Timeline Event
  document.getElementById('add-timeline-btn').addEventListener('click', () => {
    addTimelineEventForm();
  });

  // Add Member Card
  document.getElementById('add-member-btn').addEventListener('click', () => {
    addMemberForm();
  });

  // Drag and Drop Container Sorting Logic
  const membersContainer = document.getElementById('members-container');
  membersContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingEl = document.querySelector('.member-item-form.dragging');
    if (!draggingEl) return;
    
    const afterElement = getDragAfterElement(membersContainer, e.clientY);
    if (afterElement == null) {
      membersContainer.appendChild(draggingEl);
    } else {
      membersContainer.insertBefore(draggingEl, afterElement);
    }
  });

  // Save Settings Locally (LocalStorage or direct disk if helper is running)
  document.getElementById('save-btn').addEventListener('click', async () => {
    const updatedConfig = readFormValues();
    updatedConfig.lastUpdated = Date.now(); // Add timestamp
    const jsContent = constructConfigJsString(updatedConfig);
    
    const alert = document.getElementById('save-alert');
    
    // Attempt saving to local disk via helper server
    const diskSaved = await saveToDisk(jsContent);
    
    if (diskSaved) {
      alert.className = "alert alert-success";
      alert.textContent = "ローカルの config.js ファイルに直接上書き保存しました！「サイトを見る」ボタンから即座にプレビューを確認できます。";
      alert.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Keep alert visible for 8 seconds
      setTimeout(() => {
        alert.style.display = 'none';
      }, 8000);
      
      // Sync LocalStorage as well for backup
      try {
        localStorage.setItem('band_config_data', JSON.stringify(updatedConfig));
      } catch (e) {}
    } else {
      // Local helper is not running, fallback to LocalStorage
      try {
        localStorage.setItem('band_config_data', JSON.stringify(updatedConfig));
        
        alert.className = "alert alert-success";
        alert.textContent = "設定をブラウザに一時的に保存しました（プレビュー可能）。ローカルのファイルに直接保存したり、1クリックでNetlifyに公開するには、run_helper.bat を起動してください。";
        alert.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
          alert.style.display = 'none';
        }, 12000);
      } catch (error) {
        console.error('LocalStorage save failed:', error);
        
        alert.className = "alert alert-danger";
        alert.style.background = "rgba(239, 68, 68, 0.1)";
        alert.style.border = "1px solid rgba(239, 68, 68, 0.3)";
        alert.style.color = "#ef4444";
        alert.textContent = "【容量制限エラー】登録された画像やBGMの合計サイズがブラウザの保存容量制限を超えたため、一時保存に失敗しました。フォルダ内の「run_helper.bat」を起動して「直接保存」を実行するか、下部の「config.jsファイルを書き出し」ボタンをご利用ください（直接保存・ファイル書き出しには容量制限はありません）。";
        alert.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });

  // Export config.js
  document.getElementById('export-btn').addEventListener('click', () => {
    const updatedConfig = readFormValues();
    exportConfigJs(updatedConfig);
  });

  // Deploy to Netlify
  const deployBtn = document.getElementById('deploy-btn');
  const deployModal = document.getElementById('deploy-modal');
  const deployLoadingBox = document.getElementById('deploy-loading-box');
  const deployStatusText = document.getElementById('deploy-status-text');
  const deployResultBox = document.getElementById('deploy-result-box');
  const deploySuccessIcon = document.getElementById('deploy-success-icon');
  const deployErrorIcon = document.getElementById('deploy-error-icon');
  const deployResultMessage = document.getElementById('deploy-result-message');
  const deployResultDetail = document.getElementById('deploy-result-detail');
  const deployLiveLink = document.getElementById('deploy-live-link');
  const deployCloseBtn = document.getElementById('deploy-close-btn');

  deployBtn.addEventListener('click', async () => {
    // Show loading modal
    deployModal.style.display = 'flex';
    deployLoadingBox.style.display = 'block';
    deployStatusText.textContent = "現在の編集内容をローカルの config.js に書き込み中...";
    deployResultBox.style.display = 'none';
    deploySuccessIcon.style.display = 'none';
    deployErrorIcon.style.display = 'none';
    deployLiveLink.style.display = 'none';
    deployCloseBtn.style.display = 'none';

    // Step 1: Read current form and save config.js to disk
    const updatedConfig = readFormValues();
    updatedConfig.lastUpdated = Date.now();
    const jsContent = constructConfigJsString(updatedConfig);
    
    const saved = await saveToDisk(jsContent);
    if (!saved) {
      // Local helper server is not running
      deployLoadingBox.style.display = 'none';
      deployResultBox.style.display = 'block';
      deployErrorIcon.style.display = 'flex';
      deployResultMessage.textContent = "ローカルサーバーが起動していません";
      deployResultDetail.textContent = "自動公開を実行するには、まずフォルダ内にある「run_helper.bat」をダブルクリックして黒いウィンドウ（ローカルサーバー）を起動してください。";
      deployCloseBtn.style.display = 'block';
      return;
    }

    // Also sync LocalStorage
    try {
      localStorage.setItem('band_config_data', JSON.stringify(updatedConfig));
    } catch (e) {}

    // Step 2: Request GitHub Pages Deploy from Helper Server
    deployStatusText.textContent = "変更内容をコミットしてGitHubに送信中...";
    try {
      const response = await fetch('http://localhost:3000/deploy', {
        method: 'POST'
      });
      const data = await response.json();
      
      deployLoadingBox.style.display = 'none';
      deployResultBox.style.display = 'block';
      
      if (response.ok && data.status === "success") {
        deploySuccessIcon.style.display = 'flex';
        deployResultMessage.textContent = "公開処理が完了しました！";
        deployResultDetail.textContent = "最新の設定とコンテンツがGitHub Pagesに送信されました。実際にネット上のサイトに反映されるまでには数分（最大5分程度）かかる場合があります。";
        deployLiveLink.href = data.url;
        deployLiveLink.textContent = "公開されたサイトを見る";
        deployLiveLink.style.display = 'inline-flex';
      } else {
        deployErrorIcon.style.display = 'flex';
        deployResultMessage.textContent = "公開エラー";
        deployResultDetail.textContent = data.message || "GitHubへのデプロイ中にエラーが発生しました。リポジトリや認証の設定を確認してください。";
      }
    } catch (error) {
      deployLoadingBox.style.display = 'none';
      deployResultBox.style.display = 'block';
      deployErrorIcon.style.display = 'flex';
      deployResultMessage.textContent = "通信エラー";
      deployResultDetail.textContent = "ローカルサーバーとの接続中にエラーが発生しました: " + error.message;
    }
    
    deployCloseBtn.style.display = 'block';
  });

  deployCloseBtn.addEventListener('click', () => {
    deployModal.style.display = 'none';
  });
}

/**
   Reads values from form and constructs BAND_CONFIG object
 */
function readFormValues() {
  const config = {
    bandName: document.getElementById('band-name-input').value,
    tagline: document.getElementById('tagline-input').value,
    heroImage: document.getElementById('hero-image-input').value,
    spotifyEmbedId: document.getElementById('spotify-embed-input').value,
    spotifyPlaylistUrl: document.getElementById('spotify-playlist-url-input').value,
    youtubePlaylistUrl: document.getElementById('youtube-playlist-url-input').value,
    gameImages: [],
    gameMusics: [],
    gameMusicDetails: [],
    gameImage: 'assets/space.png', // Fallback for single image compatibility
    concept: {
      title: "CONCEPT",
      subtitle: document.getElementById('concept-subtitle-input').value,
      description: []
    },
    biography: {
      title: "BIOGRAPHY",
      story: "結成から現在に至るまでの奇跡と軌跡。",
      timeline: []
    },
    members: []
  };

  // Read Game images & musics (5 slots)
  for (let i = 0; i < 5; i++) {
    const valImg = document.getElementById(`game-image-input-${i}`).value;
    config.gameImages.push(valImg || '');

    const valMusic = document.getElementById(`game-music-input-${i}`).value;
    config.gameMusics.push(valMusic || '');

    const title = document.getElementById(`game-music-title-${i}`).value.trim();
    const titleLink = document.getElementById(`game-music-title-link-${i}`).value.trim();
    const artist = document.getElementById(`game-music-artist-${i}`).value.trim();
    const artistLink = document.getElementById(`game-music-artist-link-${i}`).value.trim();
    config.gameMusicDetails.push({ title, titleLink, artist, artistLink });
  }
  // Ensure gameImage has the first valid image or fallback for compatibility
  const firstValidImage = config.gameImages.find(img => img !== '');
  config.gameImage = firstValidImage || 'assets/space.png';

  // Read Hockey characters configuration
  config.hockeyCharacters = [];
  for (let i = 0; i < 3; i++) {
    const name = document.getElementById(`hockey-name-${i}`).value.trim();
    const difficulty = document.getElementById(`hockey-difficulty-${i}`).value;
    const image = document.getElementById(`hockey-image-input-${i}`).value;
    const music = document.getElementById(`hockey-music-input-${i}`).value;
    
    const title = document.getElementById(`hockey-music-title-${i}`).value.trim();
    const titleLink = document.getElementById(`hockey-music-title-link-${i}`).value.trim();
    const artist = document.getElementById(`hockey-music-artist-${i}`).value.trim();
    const artistLink = document.getElementById(`hockey-music-artist-link-${i}`).value.trim();
    
    config.hockeyCharacters.push({
      name,
      difficulty,
      image,
      music,
      musicDetail: { title, titleLink, artist, artistLink }
    });
  }

  // Read Concept paragraphs
  const conceptTextareas = document.querySelectorAll('.concept-paragraph-textarea');
  conceptTextareas.forEach(ta => {
    const text = ta.value.trim();
    if (text) {
      config.concept.description.push(text);
    }
  });

  // Read Biography events
  const timelineForms = document.querySelectorAll('.timeline-item-form');
  timelineForms.forEach(form => {
    const year = form.querySelector('.timeline-year').value.trim();
    const title = form.querySelector('.timeline-title').value.trim();
    const description = form.querySelector('.timeline-description').value.trim();
    
    if (year || title || description) {
      config.biography.timeline.push({ year, title, description });
    }
  });

  // Read Members
  const memberForms = document.querySelectorAll('.member-item-form');
  memberForms.forEach(form => {
    const id = form.querySelector('.member-id').value.trim() || 'member_' + Math.random().toString(36).substr(2, 5);
    const name = form.querySelector('.member-name').value.trim();
    const role = form.querySelector('.member-role').value.trim();
    const image = form.querySelector('.member-image-path').value.trim() || 'assets/avatar.png';
    const bio = form.querySelector('.member-bio').value.trim();
    
    const x = form.querySelector('.member-sns-x').value.trim();
    const instagram = form.querySelector('.member-sns-instagram').value.trim();
    const tiktok = form.querySelector('.member-sns-tiktok').value.trim();
    const youtube = form.querySelector('.member-sns-youtube').value.trim();
    const spotify = form.querySelector('.member-sns-spotify').value.trim();
    const embed = form.querySelector('.member-embed').value.trim();

    if (name || role || bio) {
      config.members.push({
        id,
        name,
        role,
        image,
        bio,
        sns: { x, instagram, tiktok, youtube, spotify },
        embed
      });
    }
  });

  config.lastUpdated = Date.now();
  return config;
}

/**
   Generates a download link for config.js file (Fallback manual download)
 */
function exportConfigJs(config) {
  const jsContent = constructConfigJsString(config);

  // Create a blob and trigger download
  const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.setAttribute('download', 'config.js');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
   Helper function to find the element that the drag is currently over
 */
function getDragAfterElement(container, y) {
  // Get all draggable elements except the one currently dragging
  const draggableElements = [...container.querySelectorAll('.member-item-form:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
   Helper function to save configuration file directly to disk
 */
async function saveToDisk(jsContent) {
  try {
    const response = await fetch('http://localhost:3000/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: jsContent
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
   Constructs the config.js JavaScript file content
 */
function constructConfigJsString(config) {
  return `// ==========================================
// A.M.F - Website Configuration File
// ==========================================
// このファイルはエディターツールによって自動生成されました。
// 手動で編集することも可能ですが、カンマやクォーテーションの構文エラーにご注意ください。

const BAND_CONFIG = ${JSON.stringify(config, null, 2)};

// グローバル変数としてアタッチ
window.BAND_CONFIG = BAND_CONFIG;
`;
}
