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
    this.parent(null, IndicatorNameText, false);
    this._refreshIntervalSeconds = 30;
    this._iconCases = new St.Icon({icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon'
    });
    this._iconRecovered = new St.Icon({icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon'
    });
    this._iconDead = new St.Icon({icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon'
    });
    this._iconCases.gicon = Gio.icon_new_for_string( Me.path+'/emotion-unhappy-fill.svg');
    this._iconRecovered.gicon = Gio.icon_new_for_string( Me.path+'/emotion-fill.svg');
    this._iconDead.gicon = Gio.icon_new_for_string( Me.path+'/skull-fill.svg');
    this._infoCases = new St.Label({
      y_align: Clutter.ActorAlign.CENTER,
      text: _('...')
    });
    this._infoRecovered = new St.Label({
      y_align: Clutter.ActorAlign.CENTER,
      text: _('...')
    });   
    this._infoDead = new St.Label({
      y_align: Clutter.ActorAlign.CENTER,
      text: _('...')
    });
    let indicator = new St.BoxLayout();
    indicator.add_actor(this._iconCases);
    indicator.add_actor(this._infoCases);
    indicator.add_actor(this._iconRecovered);
    indicator.add_actor(this._infoRecovered);
    indicator.add_actor(this._iconDead);
    indicator.add_actor(this._infoDead);
    this.actor.add_actor(indicator);
    this.actor.add_style_class_name('panel-status-button');

    let d = new St.BoxLayout();
    this.actor.reparent(d);
    d.remove_actor(this.actor);
    d.destroy();

    let children = null;
    children = Main.panel._leftBox.get_children();
    Main.panel._leftBox.insert_child_at_index(this.actor, 0);
    
    this._refreshIntervalSeconds = 180;
    this._url = CovidApiUrl;
    this._soupSession = null;
    this._canConnect = null;
    this._refresh();
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
    }));
    },
  _processJson: function(json) {
    let cases = JSON.stringify(json['Global']['TotalConfirmed']);
    this._infoCases.text = cases.substring(0, cases.length - 6) + '.' + cases.substring(cases.length - 6, cases.length - 4) + 'm';
    let recovered = JSON.stringify(json['Global']['TotalRecovered']);
    this._infoRecovered.text = recovered.substring(0, recovered.length - 6) + '.' + recovered.substring(recovered.length - 6, recovered.length - 4) + 'm';
    let dead = JSON.stringify(json['Global']['TotalDeaths']);
    this._infoDead.text = dead.substring(0, dead.length - 3) + 'k';
  },

  _refresh: function () {
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
    this.updateStatistics();
    this._timeout = Mainloop.timeout_add_seconds(this._refreshIntervalSeconds, Lang.bind(this, this._refresh));
  }


});

function init() {
}

function enable() {
  var covidIndicator = new CovidIndicator();
  Main.panel.addToStatusArea(IndicatorNameText, covidIndicator);
}

function disable() {
  covidIndicator.destroy();
  covidIndicator = null;
}
