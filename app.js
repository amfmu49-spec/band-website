/* ==========================================================================
   A.M.F - Javascript Logic (Dynamic Rendering & Interactive UI)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if there is saved config in localStorage (from admin editor)
  let config = null;
  const localData = localStorage.getItem('band_config_data');
  const fileConfig = window.BAND_CONFIG;
  
  if (localData) {
    try {
      const parsedLocal = JSON.parse(localData);
      // If config.js is newer than localStorage, clear localStorage and use config.js
      if (fileConfig && fileConfig.lastUpdated && parsedLocal.lastUpdated && fileConfig.lastUpdated > parsedLocal.lastUpdated) {
        localStorage.removeItem('band_config_data');
        config = fileConfig;
        console.log('Detected newer config.js. Cleared local cache.');
      } else if (fileConfig && fileConfig.lastUpdated && !parsedLocal.lastUpdated) {
        localStorage.removeItem('band_config_data');
        config = fileConfig;
      } else {
        config = parsedLocal;
      }
    } catch (e) {
      console.error('LocalStorage config parse failed, falling back to config.js.', e);
      config = fileConfig;
    }
  } else {
    config = fileConfig;
  }

  if (!config) {
    console.error('Configuration file (config.js) not found or failed to load.');
    return;
  }

  // Initialize all components
  initContent(config);
  initModal(config);
  initSpotifyPlayer(config);
  initYoutubePlayer(config);
  initNavigation();
  initMobileMenu();
  initLoader();
  initVisitorCounter();
});

/**
 * 1. Dynamic Content Rendering
 */
function initContent(config) {
  // Global metadata
  document.title = `${config.bandName} Official Web Site`;
  document.getElementById('band-title').textContent = config.bandName;
  document.getElementById('header-logo-text').textContent = config.bandName;
  document.querySelector('.footer-logo').textContent = config.bandName;
  document.getElementById('band-tagline').textContent = config.tagline;
  document.getElementById('hero-img').src = config.heroImage;

  // Concept Section
  document.getElementById('concept-title').textContent = config.concept.title;
  document.getElementById('concept-subtitle').textContent = config.concept.subtitle;
  
  const conceptDescContainer = document.getElementById('concept-description');
  conceptDescContainer.innerHTML = '';
  config.concept.description.forEach(paragraph => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    conceptDescContainer.appendChild(p);
  });

  // Biography Section
  document.getElementById('biography-title').textContent = config.biography.title;
  document.getElementById('biography-story').textContent = config.biography.story;
  
  const timelineContainer = document.getElementById('biography-timeline');
  timelineContainer.innerHTML = '';
  config.biography.timeline.forEach((event, index) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-year">${event.year}</div>
        <div class="timeline-item-title">${event.title}</div>
        <div class="timeline-item-desc">${event.description}</div>
      </div>
    `;
    timelineContainer.appendChild(item);
  });

  // Member Section
  document.getElementById('member-title').textContent = config.members.title || 'MEMBER';
  
  const memberCountBadge = document.getElementById('member-count-badge');
  if (memberCountBadge) {
    memberCountBadge.textContent = `${config.members.length} 名のメンバーが在籍`;
  }

  const memberListContainer = document.getElementById('member-list');
  memberListContainer.innerHTML = '';
  config.members.forEach((member, index) => {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.setAttribute('data-member-id', member.id);
    card.setAttribute('tabindex', '0');
    
    // Add specific indicator border styling based on member index
    const colorClasses = ['primary', 'secondary', 'accent'];
    const colorClass = colorClasses[index % colorClasses.length];
    
    card.innerHTML = `
      <div class="member-img-wrapper">
        <img src="${member.image}" alt="${member.name}" class="member-card-img" loading="lazy">
      </div>
      <div class="member-card-overlay"></div>
      <div class="member-card-info">
        <span class="member-card-role" style="color: var(--color-${colorClass})">${member.role}</span>
        <h3 class="member-card-name">${member.name}</h3>
        <div class="member-card-action">
          <span>VIEW PROFILE</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    `;
    memberListContainer.appendChild(card);
  });
}

/**
 * 2. Member Detail Modal Implementation
 */
function initModal(config) {
  const modal = document.getElementById('member-modal');
  const modalBackdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = document.getElementById('close-modal-btn');
  const memberCards = document.querySelectorAll('.member-card');

  // SVG social icons lookup table
  const snsIcons = {
    x: `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
    youtube: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
    spotify: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.894-.978-.335.077-.67-.133-.746-.47-.077-.335.132-.67.47-.746 3.856-.88 7.15-.51 9.823 1.127.295.18.387.563.207.86zm1.225-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.676-1.114 8.243-.574 11.346 1.33.367.227.487.708.26 1.075zm.105-2.82c-3.26-1.937-8.644-2.114-11.756-1.17-.5.152-1.026-.13-1.177-.63-.15-.5.13-1.027.63-1.177 3.616-1.097 9.563-.895 13.314 1.333.45.267.6.843.333 1.294-.266.45-.842.6-1.293.333z"/></svg>`,
    default: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
  };

  const openModal = (memberId) => {
    const member = config.members.find(m => m.id === memberId);
    if (!member) return;

    // Unload background sticky player to prevent audio overlap
    if (typeof window.unloadStickyPlayer === 'function') {
      window.unloadStickyPlayer();
    }
    
    // Close sticky player panel if open
    const stickyPlayer = document.getElementById('spotify-sticky-player');
    if (stickyPlayer) {
      stickyPlayer.classList.remove('open');
    }
    
    // Reset trigger states
    const toggleBtnMobile = document.getElementById('nav-item-spotify-toggle');
    if (toggleBtnMobile) toggleBtnMobile.classList.remove('active');
    const desktopTrigger = document.querySelector('.desktop-player-trigger');
    if (desktopTrigger) desktopTrigger.classList.remove('active');

    // Populate modal fields
    document.getElementById('modal-member-img').src = member.image;
    document.getElementById('modal-member-img').alt = member.name;
    document.getElementById('modal-member-role').textContent = member.role;
    document.getElementById('modal-member-name').textContent = member.name;
    document.getElementById('modal-member-bio').textContent = member.bio;

    // Populate Embed Element
    const embedContainer = document.getElementById('modal-member-embed');
    if (embedContainer) {
      if (member.embed && member.embed.trim() !== '') {
        embedContainer.innerHTML = member.embed;
        embedContainer.style.display = 'block';
      } else {
        embedContainer.innerHTML = '';
        embedContainer.style.display = 'none';
      }
    }

    // Populate SNS Links
    const snsContainer = document.getElementById('modal-member-sns');
    snsContainer.innerHTML = '';
    
    const hasX = member.sns.x && member.sns.x.trim() !== '';
    const hasTiktok = member.sns.tiktok && member.sns.tiktok.trim() !== '';
    const hasYoutube = member.sns.youtube && member.sns.youtube.trim() !== '';
    
    // Standard links wrapper (Instagram, Spotify, etc.)
    const standardLinksWrapper = document.createElement('div');
    standardLinksWrapper.className = 'modal-sns-icons';
    
    Object.entries(member.sns).forEach(([key, url]) => {
      if (url && url.trim() !== '' && key !== 'tiktok' && key !== 'x' && key !== 'youtube') {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'sns-link';
        link.setAttribute('aria-label', `${member.name}'s ${key}`);
        link.innerHTML = snsIcons[key] || snsIcons.default;
        standardLinksWrapper.appendChild(link);
      }
    });
    
    if (standardLinksWrapper.children.length > 0) {
      snsContainer.appendChild(standardLinksWrapper);
    }
    
    // Add special button for X if link exists
    if (hasX) {
      const xBtn = document.createElement('a');
      xBtn.href = member.sns.x;
      xBtn.target = '_blank';
      xBtn.rel = 'noopener noreferrer';
      xBtn.className = 'modal-x-btn';
      xBtn.innerHTML = `
        ${snsIcons.x}
        <span>${member.name} の X はこちら</span>
      `;
      snsContainer.appendChild(xBtn);
    }
    
    // Add special button for TikTok if link exists
    if (hasTiktok) {
      const tiktokBtn = document.createElement('a');
      tiktokBtn.href = member.sns.tiktok;
      tiktokBtn.target = '_blank';
      tiktokBtn.rel = 'noopener noreferrer';
      tiktokBtn.className = 'modal-tiktok-btn';
      tiktokBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
        </svg>
        <span>${member.name} の TikTok はこちら</span>
      `;
      snsContainer.appendChild(tiktokBtn);
    }

    // Add special button for YouTube if link exists
    if (hasYoutube) {
      const youtubeBtn = document.createElement('a');
      youtubeBtn.href = member.sns.youtube;
      youtubeBtn.target = '_blank';
      youtubeBtn.rel = 'noopener noreferrer';
      youtubeBtn.className = 'modal-youtube-btn';
      youtubeBtn.innerHTML = `
        ${snsIcons.youtube}
        <span>${member.name} の YouTube はこちら</span>
      `;
      snsContainer.appendChild(youtubeBtn);
    }

    // Animate Modal Open
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = ''; // Restore background scrolling
    
    // Reload the background sticky player
    if (typeof window.reloadStickyPlayer === 'function') {
      window.reloadStickyPlayer();
    }
  };

  // Attach card click handlers
  memberCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-member-id');
      openModal(id);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const id = card.getAttribute('data-member-id');
        openModal(id);
      }
    });
  });

  // Attach close handlers
  closeBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/**
 * 3. Spotify Player Embeds (Inline & Sticky Drawer)
 */
function initSpotifyPlayer(config) {
  // Embed Spotify URL Structure
  const baseSpotifyUrl = `https://open.spotify.com/embed/${config.spotifyEmbedId}?utm_source=generator&theme=0`;

  // Set Spotify Playlist Embed Url dynamically if defined
  const spotifyPlaylistIframe = document.getElementById('spotify-playlist-iframe');
  if (spotifyPlaylistIframe && config.spotifyPlaylistUrl) {
    spotifyPlaylistIframe.src = config.spotifyPlaylistUrl;
  }



  // 2. Sticky Drawer Spotify Player setup
  const stickyPlayer = document.getElementById('spotify-sticky-player');
  const stickyContainer = document.getElementById('spotify-sticky-iframe-container');
  const closeStickyBtn = document.getElementById('close-sticky-player');
  const toggleBtnMobile = document.getElementById('nav-item-spotify-toggle');
  
  // Expose unload/reload functions globally to avoid double playback when modal opens
  window.unloadStickyPlayer = () => {
    if (stickyContainer) {
      stickyContainer.innerHTML = ''; // Stops music instantly by clearing iframe
    }
  };

  window.reloadStickyPlayer = () => {
    if (stickyContainer && !stickyContainer.querySelector('iframe')) {
      stickyContainer.innerHTML = `
        <iframe 
          style="border-radius:12px" 
          src="${baseSpotifyUrl}" 
          width="100%" 
          height="152px" 
          frameBorder="0" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy">
        </iframe>
      `;
    }
  };

  // Initial load
  window.reloadStickyPlayer();

  const toggleStickyPlayer = () => {
    stickyPlayer.classList.toggle('open');
    
    // Toggle active state on buttons
    const isActive = stickyPlayer.classList.contains('open');
    if (toggleBtnMobile) {
      toggleBtnMobile.classList.toggle('active', isActive);
    }
    
    const desktopTrigger = document.querySelector('.desktop-player-trigger');
    if (desktopTrigger) {
      desktopTrigger.classList.toggle('active', isActive);
    }
  };

  const closeStickyPlayer = () => {
    stickyPlayer.classList.remove('open');
    if (toggleBtnMobile) toggleBtnMobile.classList.remove('active');
    
    const desktopTrigger = document.querySelector('.desktop-player-trigger');
    if (desktopTrigger) desktopTrigger.classList.remove('active');
  };

  // Mobile Bottom Bar listener
  if (toggleBtnMobile) {
    toggleBtnMobile.addEventListener('click', (e) => {
      e.preventDefault();
      toggleStickyPlayer();
    });
  }

  // Sticky header drag handle close action
  const stickyHandle = document.querySelector('.sticky-player-handle');
  if (stickyHandle) {
    stickyHandle.addEventListener('click', toggleStickyPlayer);
  }

  closeStickyBtn.addEventListener('click', closeStickyPlayer);

  // 3. Desktop Sticky Trigger (Dynamically create floating button since desktop has no bottom nav)
  if (window.innerWidth >= 768) {
    createDesktopStickyTrigger(toggleStickyPlayer);
  }

  // Re-calculate on screen resize
  window.addEventListener('resize', () => {
    const existingTrigger = document.querySelector('.desktop-player-trigger');
    if (window.innerWidth >= 768 && !existingTrigger) {
      createDesktopStickyTrigger(toggleStickyPlayer);
    } else if (window.innerWidth < 768 && existingTrigger) {
      existingTrigger.remove();
    }
  });
}

/**
 * Creates a floating audio bubble for desktop devices
 */
function createDesktopStickyTrigger(onClickCallback) {
  const trigger = document.createElement('button');
  trigger.className = 'desktop-player-trigger';
  trigger.setAttribute('aria-label', 'Toggle Music Player');
  trigger.innerHTML = `
    <div class="music-wave-icon">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  trigger.addEventListener('click', onClickCallback);
  document.body.appendChild(trigger);
}

/**
 * 4. Active Navigation Observer & Highlights
 */
function initNavigation() {
  const sections = document.querySelectorAll('section');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileNavItems = document.querySelectorAll('.mobile-menu-overlay .mobile-nav-link');

  // Options for IntersectionObserver
  const observerOptions = {
    root: null, // Viewport
    rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the middle portion
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeSectionId = entry.target.getAttribute('id');

        // Highlight Desktop Header Nav
        desktopLinks.forEach(link => {
          const href = link.getAttribute('href').substring(1);
          link.classList.toggle('active', href === activeSectionId);
        });

        // Highlight Mobile Navigation Overlay
        mobileNavItems.forEach(item => {
          const href = item.getAttribute('href');
          if (href) {
            const cleanHref = href.substring(1);
            item.classList.toggle('active', cleanHref === activeSectionId);
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * 4.5 Mobile Header Menu Overlay Controller
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle-btn');
  const overlay = document.getElementById('mobile-menu-overlay');
  const overlayLinks = document.querySelectorAll('.mobile-menu-overlay .mobile-nav-link');

  if (!menuToggle || !overlay) return;

  const toggleMenu = () => {
    const isOpen = overlay.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    overlay.classList.add('open');
    menuToggle.classList.add('open');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
    overlay.setAttribute('aria-hidden', 'false');
  };

  const closeMenu = () => {
    overlay.classList.remove('open');
    menuToggle.classList.remove('open');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = ''; // Restore background scrolling
    overlay.setAttribute('aria-hidden', 'true');
  };

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking on any section link
  overlayLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeMenu();
    }
  });
}

/**
 * 5. Loader Overlay Controller
 */
function initLoader() {
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('fade-out');
      }, 600); // Aesthetic 600ms load delay to show elegant intro logo
    }
  });
}

/**
 * 6. Visitor Counter Logic (LocalStorage & Dynamic Simulation)
 */
function initVisitorCounter() {
  const todayEl = document.getElementById('counter-today');
  const totalEl = document.getElementById('counter-total');

  if (!todayEl || !totalEl) return;

  const namespace = 'amf-music-festival-official';
  // Get date in JST or local time format YYYY-MM-DD
  const dateObj = new Date();
  // Format as JST (since local time is JST in metadata)
  const offset = dateObj.getTimezoneOffset();
  const jstDate = new Date(dateObj.getTime() + (9 * 60 - offset) * 60 * 1000);
  const todayStr = jstDate.toISOString().split('T')[0];
  
  const totalApiUrl = `https://abacus.jasoncameron.dev/hit/${namespace}/total_views`;
  const todayApiUrl = `https://abacus.jasoncameron.dev/hit/${namespace}/today_views_${todayStr}`;

  // Helper function to animate counting up values
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Fetch TOTAL views (increment and get)
  fetch(totalApiUrl)
    .then(res => res.json())
    .then(data => {
      const totalCount = data.value || 0;
      // Animate from totalCount - 15 to totalCount to show dynamics
      const startNum = Math.max(0, totalCount - 15);
      animateValue(totalEl, startNum, totalCount, 1500);
    })
    .catch(err => {
      console.error('Failed to fetch total views counter:', err);
      totalEl.textContent = '---';
    });

  // Fetch TODAY views (increment and get)
  fetch(todayApiUrl)
    .then(res => res.json())
    .then(data => {
      const todayCount = data.value || 0;
      const startNum = Math.max(0, todayCount - 5);
      animateValue(todayEl, startNum, todayCount, 1200);
    })
    .catch(err => {
      console.error('Failed to fetch today views counter:', err);
      todayEl.textContent = '---';
    });
}

/**
 * 7. YouTube Playlist Player Embed & Random (Shuffle) Playback
 */
let ytPlayer = null;

function getYoutubePlaylistId(url) {
  if (!url) return null;
  // Extract list= parameter
  const reg = /[&?]list=([^&]+)/;
  const match = url.match(reg);
  if (match) {
    return match[1];
  }
  // If the url itself is an ID (e.g. starting with PL)
  if (url.startsWith('PL') || url.startsWith('OLAK5uy')) {
    return url;
  }
  return null;
}

function initYoutubePlayer(config) {
  const playlistUrl = config.youtubePlaylistUrl;
  const container = document.getElementById('youtube-playlist-container');
  const playlistId = getYoutubePlaylistId(playlistUrl);
  
  if (!playlistId || !container) {
    if (container) container.style.display = 'none';
    return;
  }
  
  // Show container
  container.style.display = 'block';
  
  // Load YouTube Iframe Player API asynchronously
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    document.head.appendChild(tag);
  }
  
  // API triggers this global function once loaded
  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        loop: 1
      },
      events: {
        'onReady': (event) => {
          // Shuffle playlist automatically on load
          event.target.setShuffle(true);
          // Set to loop playlist
          event.target.setLoop(true);
        }
      }
    });
  };
}
