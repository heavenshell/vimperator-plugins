var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Manage Vimperator Plugin</description>
<description lang="ja">{"Vimpeator\u30D7\u30E9\u30B0\u30A4\u30F3\u7BA1\u7406"}</description>
<version>0.1a</version>
<detail><![CDATA[
これはVimperatorプラグインの詳細情報orヘルプを表示するためのプラグインです。
== Command ==
:plugin[help] [pluginName] [-v]:
	{pluginName}を入れるとそのプラグインの詳細を表示します。
	省略すると全てのプラグインの詳細を表示します。
	オプション -v はより細かなデータを表示します

== Mapping ==
none

== ToDo ==
* hogehoge
]]></detail>
</VimperatorPlugin>;

liberator.plugins.pluginManager = (function(){

var lang = window.navigator.language;
var tags = {
	name: function(info) info.name ? info.name[0] : null,
	description: function(info){
		if (!info.description) return null;
		var desc = "";
		var length = info.description.length();
		if (length > 1){
			desc = info.description[0];
			for (var i=0; i<length; i++){
				if (info.description[i].@lang == lang)
					desc = info.description[i];
			}
		}
		return desc;
	},
	version: function(info) info.version || null,
	maxVersion: function(info) info.maxVersion || null,
	minVersion: function(info) info.minVersion || null,
	detail: function(info) {
		if (!info.detail)
			return null;

		if (info.detail.* && info.detail.*[0].nodeKind() == 'element')
			return info.detail.*;

		/*
		function fromUTF8Octets(octets){
			return decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function(c){
				return "%" + c.charCodeAt(0).toString(16);
			}));
		}
		function escapeUnicode(str){
			return str.replace(/[^ -~]|\\/g,function(m0){
				var code = m0.charCodeAt(0);
				return '\\u'+ ((code < 0x10)? '000' :
								(code < 0x100)? '00':
								(code < 0x100)? '0' : '') + code.toString(16);
			});
		}
		function unescapeUnicode(str){
			return str.replace(/\\u([a-fA-F0-9]{4})/g, function(m0,m1){
				return String.fromCharCode(parseInt(m1, 16));
			});
		}
		*/
		//var text = fromUTF8Octets(info.detail.*.toString());
		var text = info.detail.*.toString();
		/*
		var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter)
		converter.charset="UTF-16";
		text = converter.ConvertFromUnicode(text);
		*/
		var lines = text.split("\n");
		var xml = <></>;
		var ite = Iterator(lines);
		var num, line;
		try{
		while ([num, line] = ite.next()){
			if (!line) continue;
			if (/^\s*==(.*)==\s*$/.test(line)){
				line = RegExp.$1;
				xml += <h1 style="font-weight:bold;font-size:mediam;">{line}</h1>;
				continue;
			}
			var reg = /^\s*(.*)\s*:\s*$/;
			if (reg.test(line)){
				var dl = <dl><dt>{RegExp.$1}</dt></dl>;
				while ([num, line] = ite.next()){
					if (!line) break;
					if (reg.test(line)){
						dl.* += <dt>{RegExp.$1}</dt>;
					} else {
						dl.* += <dd>{line.replace(/^\s*|\s*$/g,"")}</dd>;
					}
				}
				xml += dl;
				continue;
			}
			xml += <>{line}<br/></>;
		}
		}catch(e){}
		return xml;
	}
};
function getPlugins(){
	var list = [];
	var contexts = liberator.plugins.contexts;
	for (var path in contexts){
		var context = contexts[path];
		var info = context.PLUGIN_INFO || null;
		var plugin = [
			["path", path]
		];
		plugin["name"] = context.NAME;
		if (info){
			for (var tag in tags){
				var value = tags[tag](info);
				if (value.toString().length > 0)
					plugin.push([tag, value]);
			}
		}
		list.push(plugin);
	}
	return list;
}
function itemFormater(plugin, showDetail){
	if (showDetail)
		return template.table(plugin.name, plugin);
	
	var data = plugin.filter(function($_) $_[0] != 'detail');
	return template.table(plugin.name, data);
}
commands.addUserCommand(['plugin[help]'], 'list vimperator plugin ',
	function(args){
		liberator.plugins.pluginManager.list(args[0], args['-verbose']);
	},{
		argCount: "*",
		options: [
			[['-verbose','-v'], commands.OPTION_NOARG],
		],
		completer: function(context){
			var all = getPlugins().map(function(plugin){
				var desc = '-';
				for (var i=0; i<plugin.length; i++){
					if (plugin[i][0]== 'description')
						desc = plugin[i][1];
				}
				return [plugin.name, desc];
			});
			context.title = ['PluginName', 'Description'];
			context.completions = all.filter(function(row) row[0].toLowerCase().indexOf(context.filter.toLowerCase()) >= 0);

		}
	},true);
var public = {
	list: function(name, showDetail){
		var xml = <></>;
		var plugins = getPlugins();
		if (name){
			var plugin = plugins.filter(function(plugin) plugin.name == name)[0];
			if (plugin){
				xml = itemFormater(plugin, showDetail);
			}
		} else {
			plugins.forEach(function(plugin) xml += itemFormater(plugin, showDetail));
		}
		liberator.echo(xml, true);
	},
};
return public;
})();
