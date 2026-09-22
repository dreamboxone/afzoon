'use strict';
'require view';
'require fs';
'require ui';
'require poll';

var dictionary = {
	en: {
		title: 'Afzoon', subtitle: 'USB storage, persistent swap and extroot', language: 'Language', system: 'Router overview', device: 'Connected USB storage', none: 'No USB storage is connected.', model: 'Router', openwrt: 'OpenWrt', arch: 'CPU architecture', flash: 'Internal flash', overlay: 'Active overlay', ram: 'RAM', swap: 'Swap', virtual: 'RAM + swap', capacity: 'Capacity', brand: 'Brand / model', filesystem: 'File system', port: 'USB link', partitions: 'Partitions', plan: 'Storage plan', swapEnable: 'Create persistent swap', rootEnable: 'Create persistent extroot', swapSize: 'Swap (MiB)', rootSize: 'Extroot (MiB)', available: 'Available after safety reserve', suggestion: 'Suggested extroot size', apply: 'Apply changes', safe: 'Safely remove', disable: 'Disable extroot (reboot required)', warning: 'Applying permanently erases every partition and all data on the selected USB device.', confirm: 'Erase and configure this USB device?', reboot: 'Extroot was prepared. Reboot the router to activate it.', disabled: 'Extroot is disabled for the next boot. Reboot before removing the USB device.', done: 'Changes applied.', removeWarning: 'Safe removal disables live swap and unmounts the device. Active extroot requires a reboot first.', error: 'Operation failed', refresh: 'Refresh', mib: 'MiB'
	},
	fa: {
		title: 'افزون', subtitle: 'مدیریت حافظهٔ USB، سواپ پایدار و افزایش فلش دستگاه', language: 'زبان', system: 'نمای کلی روتر', device: 'حافظهٔ USB متصل', none: 'هیچ حافظهٔ USB متصل نیست.', model: 'روتر', openwrt: 'اوپن‌ورت', arch: 'معماری پردازنده', flash: 'فلش داخلی', overlay: 'فضای فعال overlay', ram: 'رم', swap: 'سواپ', virtual: 'رم + سواپ', capacity: 'ظرفیت', brand: 'برند / مدل', filesystem: 'سیستم فایل', port: 'ارتباط USB', partitions: 'پارتیشن‌ها', plan: 'طرح‌بندی حافظه', swapEnable: 'ساخت سواپ پایدار', rootEnable: 'ساخت افزایش فلش دستگاه', swapSize: 'سواپ (MiB)', rootSize: 'افزایش فلش دستگاه (MiB)', available: 'فضای قابل استفاده پس از ذخیرهٔ ایمنی', suggestion: 'اندازهٔ پیشنهادی افزایش فلش دستگاه', apply: 'اعمال تغییرات', safe: 'حذف امن', disable: 'غیرفعال‌سازی افزایش فلش دستگاه (نیازمند ریبوت)', warning: 'با اعمال تغییرات، تمام پارتیشن‌ها و داده‌های فلش انتخاب‌شده برای همیشه پاک می‌شوند.', confirm: 'فلش انتخاب‌شده پاک و پیکربندی شود؟', reboot: 'افزایش فلش دستگاه آماده شد. برای فعال‌شدن روتر را ریبوت کنید.', disabled: 'افزایش فلش دستگاه برای بوت بعدی غیرفعال شد. پیش از جداکردن فلش، روتر را ریبوت کنید.', done: 'تغییرات اعمال شد.', removeWarning: 'حذف امن، سواپ فعال را متوقف و فلش را unmount می‌کند. افزایش فلش دستگاه فعال ابتدا به ریبوت نیاز دارد.', error: 'عملیات ناموفق بود', refresh: 'نوسازی', mib: 'MiB'
	}
};

function cmd(args) { return fs.exec_direct('/usr/sbin/afzoonctl', args, 'json'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function bar(label, value, max, color, t) {
	var width = max ? Math.min(100, Math.round(value * 100 / max)) : 0;
	return E('div', { 'class': 'afzoon-metric' }, [ E('div', { 'class': 'afzoon-label' }, label + ': ' + value + ' ' + t.mib), E('div', { 'class': 'afzoon-track' }, E('div', { 'class': 'afzoon-bar', 'style': 'width:' + width + '%;background:' + color })) ]);
}

return view.extend({
	load: function() { return cmd([ 'status' ]); },
	render: function(data) {
		var self = this, lang = data.language === 'fa' ? 'fa' : 'en', t = dictionary[lang], selected = data.devices[0] && data.devices[0].path;
		var root = E('div', { 'class': 'cbi-map afzoon', 'dir': lang === 'fa' ? 'rtl' : 'ltr' });
		var css = E('style', {}, '@font-face{font-family:Vazirmatn;src:url("/luci-static/resources/view/afzoon/fonts/Vazirmatn.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}.afzoon[dir="rtl"],.afzoon[dir="rtl"] *{font-family:Vazirmatn,sans-serif}.afzoon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.afzoon-card{padding:16px;background:var(--background-color-medium,#f5f5f5);border-radius:8px}.afzoon-metric{margin:9px 0}.afzoon-label{font-size:13px;margin-bottom:3px}.afzoon-track{height:11px;background:#d8d8d8;border-radius:8px;overflow:hidden}.afzoon-bar{height:100%;border-radius:8px}.afzoon-plan{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;align-items:end}.afzoon-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}.afzoon-danger{color:#a00;font-weight:600}.afzoon-select{max-width:430px}');
		root.appendChild(css);
		var heading = E('div', { 'class': 'cbi-section' }, [ E('h2', {}, t.title + ' ' + data.version), E('p', {}, t.subtitle) ]);
		var langButton = E('button', { 'class': 'btn cbi-button', 'click': function() { var next = lang === 'en' ? 'fa' : 'en'; cmd([ 'language', next ]).then(function() { location.reload(); }); } }, t.language + ': ' + (lang === 'en' ? 'English' : 'فارسی'));
		heading.appendChild(langButton); root.appendChild(heading);

		var s = data.system, peakStorage = Math.max(s.internal_flash_mib, s.active_overlay_mib, 1), peakMem = Math.max(s.virtual_memory_mib, 1);
		var system = E('div', { 'class': 'cbi-section' }, [ E('h3', {}, t.system), E('div', { 'class': 'afzoon-grid' }, [
			E('div', { 'class': 'afzoon-card' }, [ E('strong', {}, t.model), E('div', {}, s.model), E('strong', {}, t.openwrt), E('div', {}, s.openwrt), E('strong', {}, t.arch), E('div', {}, s.architecture) ]),
			E('div', { 'class': 'afzoon-card' }, [ bar(t.flash, s.internal_flash_mib, peakStorage, '#357edd', t), bar(t.overlay, s.active_overlay_mib, peakStorage, '#40a070', t) ]),
			E('div', { 'class': 'afzoon-card' }, [ bar(t.ram, s.ram_mib, peakMem, '#a65ad1', t), bar(t.swap, s.swap_mib, peakMem, '#e69235', t), bar(t.virtual, s.virtual_memory_mib, peakMem, '#d44b4b', t) ])
		]) ]); root.appendChild(system);

		var section = E('div', { 'class': 'cbi-section' }, E('h3', {}, t.device));
		if (!data.devices.length) { section.appendChild(E('p', {}, t.none)); root.appendChild(section); return root; }
		var select = E('select', { 'class': 'cbi-input-select afzoon-select' });
		data.devices.forEach(function(d) { select.appendChild(E('option', { 'value': d.path }, d.path + ' — ' + d.brand + ' — ' + d.size_mib + ' ' + t.mib)); });
		var info = E('div');
		var swapCheck = E('input', { 'type': 'checkbox' }), rootCheck = E('input', { 'type': 'checkbox' });
		var swapInput = E('input', { 'class': 'cbi-input-text', 'type': 'number', 'min': '0', 'step': '1', 'value': '0', 'disabled': 'disabled' });
		var rootInput = E('input', { 'class': 'cbi-input-text', 'type': 'number', 'min': '0', 'step': '1', 'value': '0', 'disabled': 'disabled' });
		function current() { return data.devices.filter(function(d) { return d.path === select.value; })[0]; }
		function refreshDevice() {
			var d = current(), files = d.partitions.map(function(p) { return p.name + ': ' + p.size_mib + ' ' + t.mib + ' (' + p.filesystem + ')'; }).join(', ') || '—';
			info.replaceChildren(E('div', { 'class': 'afzoon-grid' }, [ E('div', { 'class': 'afzoon-card' }, [ E('strong', {}, t.brand), E('div', {}, d.brand), E('strong', {}, t.capacity), E('div', {}, d.size_mib + ' ' + t.mib) ]), E('div', { 'class': 'afzoon-card' }, [ E('strong', {}, t.port), E('div', {}, d.usb + ' (' + d.speed_mbps + ' Mb/s)'), E('strong', {}, t.filesystem), E('div', {}, files) ]) ]));
			var remaining = Math.max(0, d.size_mib - 16 - (parseInt(swapInput.value, 10) || 0)); if (rootCheck.checked && (!parseInt(rootInput.value, 10) || rootInput.dataset.auto === '1')) { rootInput.value = remaining; rootInput.dataset.auto = '1'; }
		}
		function changed() { refreshDevice(); }
		select.addEventListener('change', refreshDevice); swapInput.addEventListener('input', changed); rootInput.addEventListener('input', function() { rootInput.dataset.auto = '0'; });
		swapCheck.addEventListener('change', function() { swapInput.disabled = !swapCheck.checked; if (!swapCheck.checked) swapInput.value = 0; refreshDevice(); });
		rootCheck.addEventListener('change', function() { rootInput.disabled = !rootCheck.checked; rootInput.dataset.auto = '1'; if (!rootCheck.checked) rootInput.value = 0; refreshDevice(); });
		section.appendChild(select); section.appendChild(info); refreshDevice();
		var plan = E('div', { 'class': 'afzoon-plan' }, [ E('label', {}, [ swapCheck, ' ' + t.swapEnable, swapInput ]), E('label', {}, [ rootCheck, ' ' + t.rootEnable, rootInput ]), E('div', {}, t.available + ': ' + Math.max(0, current().size_mib - 16) + ' ' + t.mib) ]);
		section.appendChild(E('h3', {}, t.plan)); section.appendChild(plan); section.appendChild(E('p', { 'class': 'afzoon-danger' }, t.warning));
		var apply = E('button', { 'class': 'btn cbi-button cbi-button-apply', 'click': function() {
			var d = current(), sw = swapCheck.checked ? parseInt(swapInput.value, 10) || 0 : 0, rt = rootCheck.checked ? parseInt(rootInput.value, 10) || 0 : 0;
			if (!confirm(t.confirm + '\n' + d.path + '\n' + d.brand)) return;
			apply.disabled = true; cmd([ 'apply', d.path, String(sw), String(rt) ]).then(function(r) { ui.addNotification(null, E('p', {}, r.ok ? (r.reboot_required ? t.reboot : t.done) : t.error + ': ' + r.error), r.ok ? 'info' : 'error'); if (r.ok) self.load().then(function(next) { root.replaceWith(self.render(next)); }); }).catch(function(e) { ui.addNotification(null, E('p', {}, t.error + ': ' + e), 'error'); }).finally(function() { apply.disabled = false; });
		} }, t.apply);
		var eject = E('button', { 'class': 'btn cbi-button cbi-button-negative', 'click': function() { var d = current(); if (!confirm(t.removeWarning + '\n' + d.path)) return; cmd([ 'safe-remove', d.path ]).then(function(r) { ui.addNotification(null, E('p', {}, r.ok ? t.done : t.error + ': ' + r.error), r.ok ? 'info' : 'error'); }); } }, t.safe);
		var disable = E('button', { 'class': 'btn cbi-button', 'click': function() { if (!confirm(t.disabled)) return; cmd([ 'disable-extroot' ]).then(function(r) { ui.addNotification(null, E('p', {}, r.ok ? t.disabled : t.error), r.ok ? 'info' : 'error'); }); } }, t.disable);
		section.appendChild(E('div', { 'class': 'afzoon-actions' }, [ apply, eject, disable ])); root.appendChild(section);
		poll.add(function() { return self.load().then(function(next) { data.devices = next.devices; data.system = next.system; if (!next.devices.some(function(d) { return d.path === select.value; })) root.replaceWith(self.render(next)); }); }, 5);
		return root;
	},
	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
