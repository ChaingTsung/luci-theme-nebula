'use strict';
'require view';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('nebula_theme', _('Nebula Theme'), _(
			'Configure login and main-page backgrounds, login avatar, signature text, and translucent panel opacity. '
			+ 'For APIs, provide a full endpoint URL and an optional dotted JSON path such as urls.regular or data.0.url. '
			+ 'For Pixiv, use your own proxy or any API that returns a browser-accessible final image URL. '
			+ 'For YouTube, paste either a video ID or a normal watch/share URL.'));

		s = m.section(form.NamedSection, 'main', 'main', _('General'));
		s.anonymous = true;

		o = s.option(form.Value, 'panel_opacity', _('Panel opacity'));
		o.placeholder = '0.75';
		o.rmempty = false;
		o.validate = function(section_id, value) {
			var n = parseFloat(value);
			if (isNaN(n) || n < 0.10 || n > 1.00)
				return _('Enter a value between 0.10 and 1.00');
			return true;
		};

		o = s.option(form.Value, 'blur_px', _('Backdrop blur (px)'));
		o.placeholder = '14';
		o.rmempty = false;
		o.validate = function(section_id, value) {
			var n = parseInt(value, 10);
			if (isNaN(n) || n < 0 || n > 40)
				return _('Enter an integer between 0 and 40');
			return true;
		};

		o = s.option(form.Value, 'avatar_url', _('Login avatar URL or local path'));
		o.placeholder = '/luci-static/nebula/avatar-default.svg';
		o.rmempty = false;

		o = s.option(form.Value, 'signature_text', _('Manual signature text'));
		o.placeholder = 'No quote, no life.';

		o = s.option(form.Value, 'signature_api_url', _('Signature API URL'));
		o.placeholder = 'https://v1.hitokoto.cn/';

		o = s.option(form.Value, 'signature_api_path', _('Signature API JSON path'));
		o.placeholder = 'hitokoto';

		o = s.option(form.TextValue, 'custom_css', _('Custom CSS'));
		o.rows = 8;
		o.placeholder = '.brand { letter-spacing: .08em; }';

		s = m.section(form.NamedSection, 'main', 'main', _('Login background'));
		s.anonymous = true;

		o = s.option(form.ListValue, 'login_bg_provider', _('Source type'));
		o.value('url', _('Direct URL or local path'));
		o.value('api', _('API endpoint'));
		o.value('youtube', _('YouTube background'));
		o.rmempty = false;

		o = s.option(form.ListValue, 'login_bg_type', _('Media type'));
		o.value('image', _('Image'));
		o.value('video', _('Video'));
		o.value('auto', _('Auto detect from URL'));
		o.depends('login_bg_provider', 'url');
		o.depends('login_bg_provider', 'api');

		o = s.option(form.Value, 'login_bg_url', _('Fallback media URL or local path'));
		o.placeholder = '/luci-static/nebula/background-default.svg';
		o.depends('login_bg_provider', 'url');
		o.depends('login_bg_provider', 'api');

		o = s.option(form.Value, 'login_bg_api_url', _('API endpoint URL'));
		o.placeholder = 'https://api.unsplash.com/photos/random?orientation=landscape&client_id=YOUR_ACCESS_KEY';
		o.depends('login_bg_provider', 'api');

		o = s.option(form.Value, 'login_bg_api_path', _('API JSON path'));
		o.placeholder = 'urls.regular';
		o.depends('login_bg_provider', 'api');

		o = s.option(form.Value, 'login_bg_youtube', _('YouTube video ID or URL'));
		o.placeholder = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';
		o.depends('login_bg_provider', 'youtube');

		s = m.section(form.NamedSection, 'main', 'main', _('Main-page background'));
		s.anonymous = true;

		o = s.option(form.ListValue, 'main_bg_provider', _('Source type'));
		o.value('inherit', _('Inherit login background'));
		o.value('url', _('Direct URL or local path'));
		o.value('api', _('API endpoint'));
		o.value('youtube', _('YouTube background'));
		o.rmempty = false;

		o = s.option(form.ListValue, 'main_bg_type', _('Media type'));
		o.value('image', _('Image'));
		o.value('video', _('Video'));
		o.value('auto', _('Auto detect from URL'));
		o.depends('main_bg_provider', 'url');
		o.depends('main_bg_provider', 'api');

		o = s.option(form.Value, 'main_bg_url', _('Fallback media URL or local path'));
		o.placeholder = '/luci-static/nebula/background-default.svg';
		o.depends('main_bg_provider', 'url');
		o.depends('main_bg_provider', 'api');

		o = s.option(form.Value, 'main_bg_api_url', _('API endpoint URL'));
		o.placeholder = 'https://example.com/api/background';
		o.depends('main_bg_provider', 'api');

		o = s.option(form.Value, 'main_bg_api_path', _('API JSON path'));
		o.placeholder = 'data.url';
		o.depends('main_bg_provider', 'api');

		o = s.option(form.Value, 'main_bg_youtube', _('YouTube video ID or URL'));
		o.placeholder = 'M7lc1UVf-VE';
		o.depends('main_bg_provider', 'youtube');

		return m.render();
	}
});
