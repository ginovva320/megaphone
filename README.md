# Megaphone

Notify your team of a new release by sharing the release notes via Hipchat.
This is designed to be used with changelogs generated with
[conventional-changelog](https://github.com/ajoslin/conventional-changelog).

Megaphone reads your changelog, takes the most recent version's changes,
converts the markdown into HTML, and then sends it to Hipchat.

Megaphone exports one function which can optionally take a settings object
as an argument. A promise is returned.

## Options

* **header**: A markdown message to include before the changelog
* **key**: Your HipChat notification key. Can be specified via HIPCHAT_KEY env var.
* **room**: HipChat room to send the message to. Can be specified via HIPCHAT_ROOM env var.
* **notify**: Whether or not this message should trigger a notification for people in the room. Can be specified via NOTIFY env var.
* **changelog**: Path to changelog file. Defaults to 'CHANGELOG.md'.
* **encoding**: Encoding of changelog file. Defaults to 'utf8'.
* **pattern**: Pattern to split the changelog by in order to send a portion of it.
* **n**: Changelog portion to send should end at the nth pattern. Defaults to 2.
* **color**: Color of HipChat message. Defaults to 'yellow'.
* **showdown**: Options to pass into showdown

By default, Megaphone looks for the version anchor tags in your changelog
and uses everything before the second tag. This corresponds to the most recent
release's changes. This behavior can be altered via the `pattern` and `n` options.

## Example Usage

```javascript
var megaphone = require('megaphone');

megaphone({
    room:'Dev Discussion',
    header:'A new version of **API** has been deployed to production.',
    color:'green'
}).then(() => {
    // Message sent
}).catch(e => {
    // Error reading file or sending message
});
```

Using gulp? It's easy to include this as a task, since it returns a promise.

```
gulp.task('megaphone', () => {
    return megaphone({
        room: 'Dev Discussion'
    });
});
```
