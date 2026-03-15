(function() {
	'use strict';

	const body = document.body;
	if (!body)
		return;

	function read(name, fallback) {
		const value = body.dataset[name];
		return value == null || value === '' ? fallback : value;
	}

	function clamp(value, min, max, fallback) {
		const num = Number.parseFloat(value);
		if (!Number.isFinite(num))
			return fallback;
		return Math.min(max, Math.max(min, num));
	}

	function pathGet(obj, path) {
		if (!path)
			return obj;

		return String(path).split('.').reduce(function(acc, part) {
			if (acc == null)
				return undefined;
			const key = /^\d+$/.test(part) ? Number(part) : part;
			return acc[key];
		}, obj);
	}

	function inferType(src, fallback) {
		if (fallback && fallback !== 'auto')
			return fallback;

		return /(\.mp4|\.webm|\.ogg|\.m3u8)(\?|#|$)/i.test(src) ? 'video' : 'image';
	}

	function parseYoutubeId(input) {
		if (!input)
			return '';

		const value = String(input).trim();
		if (/^[A-Za-z0-9_-]{11}$/.test(value))
			return value;

		try {
			const url = new URL(value, window.location.href);
			if (url.hostname === 'youtu.be')
				return url.pathname.replace(/^\//, '').slice(0, 11);

			if (url.searchParams.get('v'))
				return url.searchParams.get('v').slice(0, 11);

			const parts = url.pathname.split('/').filter(Boolean);
			const marker = parts.findIndex(function(p) {
				return p === 'embed' || p === 'shorts' || p === 'live';
			});
			if (marker >= 0 && parts[marker + 1])
				return parts[marker + 1].slice(0, 11);
		}
		catch (e) {
		}

		return '';
	}

	function youtubeEmbed(input) {
		const id = parseYoutubeId(input);
		if (!id)
			return '';

		const params = new URLSearchParams({
			autoplay: '1',
			mute: '1',
			controls: '0',
			loop: '1',
			playlist: id,
			playsinline: '1',
			rel: '0'
		});

		return 'https://www.youtube.com/embed/' + id + '?' + params.toString();
	}

	function getBackgroundConfig(prefix) {
		return {
			provider: read(prefix + 'BgProvider', 'url'),
			type: read(prefix + 'BgType', 'auto'),
			url: read(prefix + 'BgUrl', ''),
			apiUrl: read(prefix + 'BgApiUrl', ''),
			apiPath: read(prefix + 'BgApiPath', ''),
			youtube: read(prefix + 'BgYoutube', '')
		};
	}

	async function fetchApiValue(apiUrl, apiPath) {
		if (!apiUrl)
			return '';

		const response = await fetch(apiUrl, { cache: 'no-store' });
		if (!response.ok)
			throw new Error('HTTP ' + response.status);

		const ctype = (response.headers.get('content-type') || '').toLowerCase();
		if (ctype.indexOf('json') > -1) {
			const payload = await response.json();
			const value = apiPath ? pathGet(payload, apiPath) : payload;
			return value == null ? '' : String(value).trim();
		}

		const text = (await response.text()).trim();
		if (!text)
			return '';

		if (apiPath) {
			try {
				const payload = JSON.parse(text);
				const value = pathGet(payload, apiPath);
				if (value != null)
					return String(value).trim();
			}
			catch (e) {
			}
		}

		return text;
	}

	async function resolveBackground(config, inherited) {
		const cfg = config.provider === 'inherit' && inherited ? inherited : config;
		if (!cfg)
			return null;

		if (cfg.provider === 'youtube') {
			const src = youtubeEmbed(cfg.youtube || cfg.url);
			return src ? { type: 'youtube', src: src } : null;
		}

		if (cfg.provider === 'api') {
			try {
				const src = await fetchApiValue(cfg.apiUrl, cfg.apiPath);
				if (src)
					return { type: inferType(src, cfg.type), src: src };
			}
			catch (e) {
				console.warn('[nebula] API background fetch failed:', e);
			}

			if (cfg.url)
				return { type: inferType(cfg.url, cfg.type), src: cfg.url };

			return null;
		}

		if (cfg.url)
			return { type: inferType(cfg.url, cfg.type), src: cfg.url };

		return null;
	}

	function ensureBackgroundRoot() {
		let root = document.getElementById('nebula-background-root');
		if (!root) {
			root = document.createElement('div');
			root.id = 'nebula-background-root';
			document.body.prepend(root);
		}
		return root;
	}

	function clearChildren(node) {
		while (node.firstChild)
			node.removeChild(node.firstChild);
	}

	function mountBackground(background) {
		const root = ensureBackgroundRoot();
		clearChildren(root);
		if (!background || !background.src)
			return;

		const layer = document.createElement('div');
		layer.className = 'nebula-bg-layer nebula-bg-' + background.type;

		if (background.type === 'youtube') {
			const iframe = document.createElement('iframe');
			iframe.src = background.src;
			iframe.allow = 'autoplay; fullscreen';
			iframe.setAttribute('aria-hidden', 'true');
			iframe.setAttribute('tabindex', '-1');
			layer.appendChild(iframe);
		}
		else if (background.type === 'video') {
			const video = document.createElement('video');
			video.src = background.src;
			video.muted = true;
			video.autoplay = true;
			video.loop = true;
			video.playsInline = true;
			video.preload = 'auto';
			video.setAttribute('aria-hidden', 'true');
			layer.appendChild(video);
		}
		else {
			const img = document.createElement('img');
			img.src = background.src;
			img.alt = '';
			img.decoding = 'async';
			layer.appendChild(img);
		}

		const overlay = document.createElement('div');
		overlay.className = 'nebula-bg-overlay';
		root.append(layer, overlay);
	}

	function setAvatar() {
		const img = document.getElementById('nebula-login-avatar');
		const src = read('nebulaAvatarUrl', '/luci-static/nebula/avatar-default.svg');
		if (img && src)
			img.src = src;
	}

	function setSignatureText(text) {
		const node = document.getElementById('nebula-login-signature');
		if (!node)
			return;

		const value = (text || '').trim();
		if (!value) {
			node.hidden = true;
			node.textContent = '';
			return;
		}

		node.hidden = false;
		node.textContent = value;
	}

	async function resolveSignature() {
		const manual = read('nebulaSignatureText', '');
		if (manual.trim()) {
			setSignatureText(manual);
			return;
		}

		const apiUrl = read('nebulaSignatureApiUrl', '');
		const apiPath = read('nebulaSignatureApiPath', '');
		if (!apiUrl) {
			setSignatureText('');
			return;
		}

		try {
			const value = await fetchApiValue(apiUrl, apiPath);
			setSignatureText(value);
		}
		catch (e) {
			console.warn('[nebula] signature API fetch failed:', e);
			setSignatureText('');
		}
	}

	function initVars() {
		const opacity = clamp(read('nebulaPanelOpacity', '0.75'), 0.10, 1.00, 0.75);
		const blur = clamp(read('nebulaBlurPx', '14'), 0, 40, 14);
		document.documentElement.style.setProperty('--nebula-panel-opacity', opacity.toFixed(2));
		document.documentElement.style.setProperty('--nebula-blur', blur.toFixed(0) + 'px');
	}

	async function init() {
		initVars();
		setAvatar();
		resolveSignature();

		const loginCfg = getBackgroundConfig('nebulaLogin');
		const mainCfg = getBackgroundConfig('nebulaMain');
		const useLogin = document.body.classList.contains('nebula-login-page');
		const bg = await resolveBackground(useLogin ? loginCfg : mainCfg, loginCfg);
		mountBackground(bg);
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', init, { once: true });
	else
		init();
})();
