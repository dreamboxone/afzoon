'use strict';
'require view';
'require fs';
'require ui';
'require poll';

var dictionary = {
	en: {
		title: 'Afzoon', subtitle: 'USB storage, persistent swap and extroot', language: 'Language', system: 'Router information', memory: 'Memory', storage: 'Storage', device: 'Connected USB storage', none: 'No USB storage is connected.', model: 'Router', openwrt: 'OpenWRT operating system', arch: 'CPU architecture', target: 'Target Platform', totalAvailable: 'Total Available', used: 'Used', buffered: 'Buffered', cached: 'Cached', flash: 'Internal flash', temp: 'Temp space', extroot: 'Extroot', swap: 'Swap', capacity: 'Capacity', brand: 'Brand / model', filesystem: 'File system', port: 'USB link', partitions: 'Partitions', plan: 'Storage plan', swapEnable: 'Create persistent swap', rootEnable: 'Create persistent extroot', swapSize: 'Swap (MB)', rootSize: 'Extroot (MB)', available: 'Available after safety reserve', suggestion: 'Suggested extroot size', apply: 'Apply changes', safe: 'Safely remove', disable: 'Disable extroot (reboot required)', warning: 'Applying permanently erases every partition and all data on the selected USB device.', confirm: 'Erase and configure this USB device?', reboot: 'Extroot was prepared. Reboot the router to activate it.', disabled: 'Extroot is disabled for the next boot. Reboot before removing the USB device.', done: 'Changes applied.', removeWarning: 'Safe removal disables live swap and unmounts the device. Active extroot requires a reboot first.', error: 'Operation failed', refresh: 'Refresh', mb: 'MB'
	},
	fa: {
		title: 'افزون', subtitle: 'مدیریت حافظهٔ USB، سواپ پایدار و افزایش فلش دستگاه', language: 'زبان', system: 'اطلاعات روتر', memory: 'حافظه', storage: 'فضای ذخیره‌سازی', device: 'حافظهٔ USB متصل', none: 'هیچ حافظهٔ USB متصل نیست.', model: 'روتر', openwrt: 'سیستم عامل OpenWRT', arch: 'معماری پردازنده', target: 'نوع دقیق معماری', totalAvailable: 'کل حافظهٔ در دسترس', used: 'استفاده‌شده', buffered: 'بافرشده', cached: 'کش‌شده', flash: 'فلش داخلی', temp: 'فضای موقت', extroot: 'افزایش فلش دستگاه', swap: 'سواپ', capacity: 'ظرفیت', brand: 'برند / مدل', filesystem: 'سیستم فایل', port: 'ارتباط USB', partitions: 'پارتیشن‌ها', plan: 'طرح‌بندی حافظه', swapEnable: 'ساخت سواپ پایدار', rootEnable: 'ساخت افزایش فلش دستگاه', swapSize: 'سواپ (مگابایت)', rootSize: 'افزایش فلش دستگاه (مگابایت)', available: 'فضای قابل استفاده پس از ذخیرهٔ ایمنی', suggestion: 'اندازهٔ پیشنهادی افزایش فلش دستگاه', apply: 'اعمال تغییرات', safe: 'حذف امن', disable: 'غیرفعال‌سازی افزایش فلش دستگاه (نیازمند ریبوت)', warning: 'با اعمال تغییرات، تمام پارتیشن‌ها و داده‌های فلش انتخاب‌شده برای همیشه پاک می‌شوند.', confirm: 'فلش انتخاب‌شده پاک و پیکربندی شود؟', reboot: 'افزایش فلش دستگاه آماده شد. برای فعال‌شدن روتر را ریبوت کنید.', disabled: 'افزایش فلش دستگاه برای بوت بعدی غیرفعال شد. پیش از جداکردن فلش، روتر را ریبوت کنید.', done: 'تغییرات اعمال شد.', removeWarning: 'حذف امن، سواپ فعال را متوقف و فلش را unmount می‌کند. افزایش فلش دستگاه فعال ابتدا به ریبوت نیاز دارد.', error: 'عملیات ناموفق بود', refresh: 'نوسازی', mb: 'مگابایت'
	}
};

function cmd(args) {
	return fs.exec_direct('/usr/sbin/afzoonctl', args, 'text').then(function(text) {
		if (!text || !text.trim()) throw new Error('Empty response from router. Check /var/run/afzoon/apply.log before retrying.');
		return JSON.parse(text);
	});
}
function runApply(args) {
	return cmd([ 'start-apply' ].concat(args)).then(function(result) {
		if (!result.ok || !result.running) return result;
		return new Promise(function(resolve, reject) {
			var failures = 0;
			function check() {
				cmd([ 'apply-status', result.job_id ]).then(function(next) {
					failures = 0;
					if (next.running) window.setTimeout(check, 2000);
					else resolve(next);
				}).catch(function(error) {
					if (++failures < 5) window.setTimeout(check, 2000);
					else reject(error);
				});
			}
			check();
		});
	});
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function number(value) { return (Number(value) || 0).toFixed(2); }
function bar(label, value, total, color, t) {
	var width = total ? Math.min(100, Math.round(value * 100 / total)) : 0;
	return E('div', { 'class': 'afzoon-stat' }, [ E('div', { 'class': 'afzoon-stat-name' }, label), E('div', { 'class': 'afzoon-stat-data' }, [ E('div', { 'class': 'afzoon-stat-value' }, number(value) + ' ' + t.mb + ' / ' + number(total) + ' ' + t.mb + ' (' + width + '%)'), E('div', { 'class': 'afzoon-track' }, E('div', { 'class': 'afzoon-bar', 'style': 'width:' + width + '%;background:' + color })) ]) ]);
}

return view.extend({
	load: function() { return cmd([ 'status' ]); },
	render: function(data) {
		var self = this, lang = data.language === 'fa' ? 'fa' : 'en', t = dictionary[lang], selected = data.devices[0] && data.devices[0].path;
		var root = E('div', { 'class': 'cbi-map afzoon', 'dir': lang === 'fa' ? 'rtl' : 'ltr' });
		var css = E('style', {}, '@font-face{font-family:Vazirmatn;src:url("/luci-static/resources/view/afzoon/fonts/Vazirmatn.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}.afzoon[dir="rtl"],.afzoon[dir="rtl"] *{font-family:Vazirmatn,sans-serif}.afzoon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.afzoon-card{padding:16px;background:var(--background-color-medium,#f5f5f5);border-radius:8px}.afzoon-info{display:grid;grid-template-columns:minmax(150px,220px) 1fr;gap:8px 18px}.afzoon-stats{border-top:1px solid var(--border-color-medium,#ccc)}.afzoon-stat{display:grid;grid-template-columns:minmax(150px,32%) 1fr;gap:16px;padding:14px;border-bottom:1px solid var(--border-color-medium,#ccc);align-items:center}.afzoon-stat-value{margin-bottom:4px}.afzoon-track{height:11px;background:#d8d8d8;border:1px solid #999;border-radius:8px;overflow:hidden}.afzoon-bar{height:100%;border-radius:8px}.afzoon-plan{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;align-items:end}.afzoon-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}.afzoon-danger{color:#a00;font-weight:600}.afzoon-select{max-width:430px}@media(max-width:600px){.afzoon-stat{grid-template-columns:1fr}.afzoon-info{grid-template-columns:1fr}}');
		root.appendChild(css);
		var heading = E('div', { 'class': 'cbi-section' }, [ E('h2', {}, t.title + ' ' + data.version), E('p', {}, t.subtitle) ]);
		var langButton = E('button', { 'class': 'btn cbi-button', 'click': function() { var next = lang === 'en' ? 'fa' : 'en'; cmd([ 'language', next ]).then(function() { location.reload(); }); } }, t.language + ': ' + (lang === 'en' ? 'English' : 'فارسی'));
		heading.appendChild(langButton); root.appendChild(heading);

		var s = data.system;
		var system = E('div', { 'class': 'cbi-section' }, [ E('h3', {}, t.system), E('div', { 'class': 'afzoon-card afzoon-info' }, [ E('strong', {}, t.model), E('div', {}, s.model), E('strong', {}, t.openwrt), E('div', {}, s.openwrt), E('strong', {}, t.arch), E('div', {}, s.architecture), E('strong', {}, t.target), E('div', {}, s.target_platform) ]) ]); root.appendChild(system);
		root.appendChild(E('div', { 'class': 'cbi-section' }, [ E('h3', {}, t.memory), E('div', { 'class': 'afzoon-stats' }, [ bar(t.totalAvailable, s.ram_available_mib, s.ram_mib, '#4197b5', t), bar(t.used, s.ram_used_mib, s.ram_mib, '#4197b5', t), bar(t.buffered, s.ram_buffered_mib, s.ram_mib, '#4197b5', t), bar(t.cached, s.ram_cached_mib, s.ram_mib, '#4197b5', t) ]) ]));
		root.appendChild(E('div', { 'class': 'cbi-section' }, [ E('h3', {}, t.storage), E('div', { 'class': 'afzoon-stats' }, [ bar(t.flash, s.internal_flash_used_mib, s.internal_flash_mib, '#4197b5', t), bar(t.temp, s.tmp_used_mib, s.tmp_mib, '#4197b5', t), bar(t.extroot, s.extroot_used_mib, s.extroot_mib, '#40a070', t), bar(t.swap, s.swap_used_mib, s.swap_mib, '#e69235', t) ]) ]));

		var section = E('div', { 'class': 'cbi-section' }, E('h3', {}, t.device));
		if (!data.devices.length) { section.appendChild(E('p', {}, t.none)); root.appendChild(section); return root; }
		var select = E('select', { 'class': 'cbi-input-select afzoon-select' });
		data.devices.forEach(function(d) { select.appendChild(E('option', { 'value': d.path }, d.path + ' — ' + d.brand + ' — ' + d.size_mib + ' ' + t.mb)); });
		var info = E('div');
		var swapCheck = E('input', { 'type': 'checkbox' }), rootCheck = E('input', { 'type': 'checkbox' });
		var swapInput = E('input', { 'class': 'cbi-input-text', 'type': 'number', 'min': '0', 'step': '1', 'value': '0', 'disabled': 'disabled' });
		var rootInput = E('input', { 'class': 'cbi-input-text', 'type': 'number', 'min': '0', 'step': '1', 'value': '0', 'disabled': 'disabled' });
		function current() { return data.devices.filter(function(d) { return d.path === select.value; })[0]; }
		function refreshDevice() {
			var d = current(), files = d.partitions.map(function(p) { return p.name + ': ' + p.size_mib + ' ' + t.mb + ' (' + p.filesystem + ')'; }).join(', ') || '—';
			info.replaceChildren(E('div', { 'class': 'afzoon-grid' }, [ E('div', { 'class': 'afzoon-card' }, [ E('strong', {}, t.brand), E('div', {}, d.brand), E('strong', {}, t.capacity), E('div', {}, d.size_mib + ' ' + t.mb) ]), E('div', { 'class': 'afzoon-card' }, [ E('strong', {}, t.port), E('div', {}, d.usb + ' (' + d.speed_mbps + ' Mb/s)'), E('strong', {}, t.filesystem), E('div', {}, files) ]) ]));
			var remaining = Math.max(0, d.size_mib - 16 - (parseInt(swapInput.value, 10) || 0)); if (rootCheck.checked && (!parseInt(rootInput.value, 10) || rootInput.dataset.auto === '1')) { rootInput.value = remaining; rootInput.dataset.auto = '1'; }
		}
		function changed() { refreshDevice(); }
		select.addEventListener('change', refreshDevice); swapInput.addEventListener('input', changed); rootInput.addEventListener('input', function() { rootInput.dataset.auto = '0'; });
		swapCheck.addEventListener('change', function() { swapInput.disabled = !swapCheck.checked; if (!swapCheck.checked) swapInput.value = 0; refreshDevice(); });
		rootCheck.addEventListener('change', function() { rootInput.disabled = !rootCheck.checked; rootInput.dataset.auto = '1'; if (!rootCheck.checked) rootInput.value = 0; refreshDevice(); });
		section.appendChild(select); section.appendChild(info); refreshDevice();
		var plan = E('div', { 'class': 'afzoon-plan' }, [ E('label', {}, [ swapCheck, ' ' + t.swapEnable, swapInput ]), E('label', {}, [ rootCheck, ' ' + t.rootEnable, rootInput ]), E('div', {}, t.available + ': ' + Math.max(0, current().size_mib - 16) + ' ' + t.mb) ]);
		section.appendChild(E('h3', {}, t.plan)); section.appendChild(plan); section.appendChild(E('p', { 'class': 'afzoon-danger' }, t.warning));
		var apply = E('button', { 'class': 'btn cbi-button cbi-button-apply', 'click': function() {
			var d = current(), sw = swapCheck.checked ? parseInt(swapInput.value, 10) || 0 : 0, rt = rootCheck.checked ? parseInt(rootInput.value, 10) || 0 : 0;
			if (!confirm(t.confirm + '\n' + d.path + '\n' + d.brand)) return;
			apply.disabled = true; runApply([ d.path, String(sw), String(rt) ]).then(function(r) { ui.addNotification(null, E('p', {}, r.ok ? (r.reboot_required ? t.reboot : t.done) : t.error + ': ' + r.error), r.ok ? 'info' : 'error'); if (r.ok) self.load().then(function(next) { root.replaceWith(self.render(next)); }); }).catch(function(e) { ui.addNotification(null, E('p', {}, t.error + ': ' + e), 'error'); }).finally(function() { apply.disabled = false; });
		} }, t.apply);
		var eject = E('button', { 'class': 'btn cbi-button cbi-button-negative', 'click': function() { var d = current(); if (!confirm(t.removeWarning + '\n' + d.path)) return; cmd([ 'safe-remove', d.path ]).then(function(r) { ui.addNotification(null, E('p', {}, r.ok ? t.done : t.error + ': ' + r.error), r.ok ? 'info' : 'error'); }); } }, t.safe);
		var disable = E('button', { 'class': 'btn cbi-button', 'click': function() { if (!confirm(t.disabled)) return; cmd([ 'disable-extroot' ]).then(function(r) { ui.addNotification(null, E('p', {}, r.ok ? t.disabled : t.error), r.ok ? 'info' : 'error'); }); } }, t.disable);
		section.appendChild(E('div', { 'class': 'afzoon-actions' }, [ apply, eject, disable ])); root.appendChild(section);
		poll.add(function refreshStatus() {
			if (!root.isConnected) { poll.remove(refreshStatus); return; }
			if (apply.disabled) return;
			return self.load().then(function(next) {
				data.devices = next.devices;
				data.system = next.system;
				if (!next.devices.some(function(d) { return d.path === select.value; })) root.replaceWith(self.render(next));
			}).catch(function() {});
		}, 5);
		return root;
	},
	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
