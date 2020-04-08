const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Clutter = imports.gi.Clutter;
const MessageTray = imports.ui.messageTray;
const PopupMenu = imports.ui.popupMenu;

const Mainloop = imports.mainloop;

let IndicatorNameText = 'COVID-19 Stats';
const CoronaIndicator = new Lang.Class({
  Name: 'CoronaIndicator', Extends: PanelMenu.Button,
  _init: function() {
    this.parent(null, IndicatorNameText);
    this._icon = new St.Icon({icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon'
    });
this._icon.gicon =Gio.icon_new_for_string( Me.path+'/test.svg');
    this.actor.add_actor(this._icon);
    this.actor.add_style_class_name('panel-status-button');
this._refresh();
this._buildMenu();
},

_buildMenu:function() {
this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
this._entryItem = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false
            });
            this.menu.addMenuItem(this._entryItem);
let head = new PopupMenu.PopupMenuSection();
		let item = new PopupMenu.PopupMenuItem(_("Test"));
		item.connect('activate', Lang.bind(this, this._testMenu));
		head.addMenuItem(item);

		this.menu.addMenuItem(head);
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
},

    _toggleMenu: function(){
global.log(this.menu.toggle);
global.log(this.menu.open);
this.menu.open();

        this.menu.toggle();
  },	_testMenu: function () {
		global.log('Test');
		return 0;
	},

  getIcon: function() {
    return '~/test.svg'
  },
_refresh: function () {
  if (this._timeout) {
    Mainloop.source_remove(this._timeout);
    this._timeout = null;
  }

  this._timeout = Mainloop.timeout_add_seconds(60, Lang.bind(this, this._refresh));
}


});

function init() {
}

function enable() {
  let coronaIndicator = new CoronaIndicator();
  Main.panel.addToStatusArea(IndicatorNameText, coronaIndicator);
}

function disable() {
  coronaIndicator.destroy();
  coronaIndicator = null;
}
