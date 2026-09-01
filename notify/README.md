
This requires (in host and pi env)
```
apt install libnotify-bin
```


Be sure to expose pi with:
```
    -v $XDG_RUNTIME_DIR/bus:$XDG_RUNTIME_DIR/bus \
    -e DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus \
```

Icons need absolute paths, so when running this in a container lets do:

```
    -e HOST_PI_IW_EXTENSIONS_DIR=<THIS_REPO_ROOT> \
```
