'use strict';

var Hipchat  = require('hipchat-client'),
    showdown = require('showdown'),
    Q        = require('q'),
    assign   = require('lodash.assign'),
    fs       = require('fs');

var readFile = Q.nfbind(fs.readFile);

/**
 * Returns text before the nth occurence of a string
 * http://stackoverflow.com/a/14480366/2163901
 * @param string
 * @param separator
 * @param n
 * @returns {*}
 */
function getTextBeforeNthString(string, separator, n) {
    var index = string.split(separator, n).join(separator).length;

    return string.substr(0, index);
}

/**
 * Reads CHANGELOG and sends a HTML portion of it to Hipchat
 * @param {Object} options
 * @param {string} [options.header] A message to include before the changelog
 * @param {string} [options.key] Your HipChat notification key. Can be specified via HIPCHAT_KEY env var.
 * @param {string} [options.room_id] HipChat room to send the message to. Can be specified via HIPCHAT_ROOM env var.
 * @param {string} [options.notify] Whether or not this message should trigger a notification for people in the room. Can be specified via NOTIFY env var.
 * @param {string} [options.changelog] Path to changelog file. Defaults to 'CHANGELOG.md'.
 * @param {string} [options.encoding] Encoding of changelog file. Defaults to 'utf8'.
 * @param {string} [options.pattern] Pattern to split the changelog by in order to send a portion of it.
 * @param {string} [options.n] Changelog portion to send should end at the nth pattern. Defaults to 2.
 * @param {string} [options.color] Color of HipChat message. Defaults to 'yellow'.
 * @param {string} [options.showdown] Options to pass into showdown
 */
module.exports = function(options) {
    var settings = {
        header: null,
        key: process.env.HIPCHAT_KEY,
        room: process.env.HIPCHAT_ROOM,
        from: process.env.FROM || 'Megaphone',
        notify: process.env.NOTIFY || 0,
        changelog: 'CHANGELOG.md',
        encoding: 'utf8',
        pattern: '<a name',
        n: 2,
        color: 'yellow',
        showdown: {
            noHeaderId: true
        }
    };

    assign(settings, options);

    return readFile(settings.changelog, settings.encoding).then(function(contents) {
        var converter   = new showdown.Converter(settings.showdown),
            client      = new Hipchat(settings.key),
            sendMessage = Q.nbind(client.api.rooms.message, client.api.rooms),
            text,
            html;

        text = getTextBeforeNthString(contents, settings.pattern, settings.n);

        if (settings.header) {
            text = settings.header + '\n' + text;
        }

        html = converter.makeHtml(text.trim());
        html = html.replace(/<(\/)?h\d>/g, '<$1b>');
        html = html.replace(/\n\n/g, '\n');
        html = html.replace(/\n/g, '<br/>');

        return sendMessage({
            message: html,
            color: settings.color,
            room_id: settings.room,
            from: settings.from,
            notify: settings.notify ? 1 : 0
        });
    });
};
