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
const Soup = imports.gi.Soup;

let IndicatorNameText = 'COVID-19 Stats';
let CovidApiUrl = 'https://api.covid19api.com/summary';

const CovidIndicator = new Lang.Class({
  Name: 'CovidIndicator', Extends: PanelMenu.Button,
  _init: function() {
    this.parent(null, IndicatorNameText);

    this._icon = new St.Icon({icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon'
    });
    this._icon.gicon = Gio.icon_new_for_string( Me.path+'/test.svg');
    
    this._info = new St.Label({
      y_align: Clutter.ActorAlign.CENTER,
      text: _('test')
    });

    let indicator = new St.BoxLayout();
    indicator.add_actor(this._icon);
    indicator.add_actor(this._info);
    this.actor.add_actor(indicator);
    this.actor.add_style_class_name('panel-status-button');

    let d = new St.BoxLayout();
    this.actor.reparent(d);
    d.remove_actor(this.actor);
    d.destroy();

    let children = null;
    children = Main.panel._leftBox.get_children();
    Main.panel._leftBox.insert_child_at_index(this.actor, children.length);
    global.log(`asd

    a
    a
    a
    a
    a
    a`);
    this._refreshIntervalSeconds = 30;
    this._url = CovidApiUrl;
    this._soupSession = null;
    this._canConnect = null;
    this._refreshStatistics();
    this._buildMenu();
  },

  _buildMenu:function() {
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this._menuItem = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
      can_focus: false
    });
    this.menu.addMenuItem(this._menuItem);
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
  },	
  
  _testMenu: function () {
    global.log('Test');
    return 0;
  },

  getIcon: function() {
    return '~/test.svg'
  }, 

  updateStatistics: function() {
    if (!this._soupSession) {
      this._soupSession = new Soup.Session();
    } else {
       this._soupSession.abort();
    }

    let message = Soup.form_request_new_from_hash('GET', this._url, {});
    this._soupSession.queue_message(message, Lang.bind(this, function(_soupSession, message) {
      try {
        this._processJson(JSON.parse(message.response_body.data));
        this._canConnect = true;
      } catch (e) {
        this._canConnect = false;
      }
      global.log(this._canConnect);
    }));
    },
  _processJson: function(json) {
    global.log(JSON.stringify(json['Global']));
    this._info.text = JSON.stringify(json['Global']['TotalConfirmed']);
  },

  _refreshStatistics: function () {
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
    this.updateStatistics();
    this._timeout = Mainloop.timeout_add_seconds(this._refreshIntervalSeconds, Lang.bind(this, this._refreshStatistics));
  }


});

function init() {
}

function enable() {
  let covidIndicator = new CovidIndicator();
  Main.panel.addToStatusArea(IndicatorNameText, covidIndicator);
}

function disable() {
  covidIndicator.destroy();
  covidIndicator = null;
}
