---
layout: "docs"
page_title: "FoundationDB - Storage Backends - Configuration"
sidebar_title: "FoundationDB"
sidebar_current: "docs-configuration-storage-foundationdb"
description: |-
  The FoundationDB storage backend is used to persist Vault's data in the
  FoundationDB KV store.
---

# FoundationDB Storage Backend

The FoundationDB storage backend is used to persist Vault's data in
[FoundationDB][foundationdb] table.

The backend needs to be explicitly enabled at build time, and is not available
in the standard Vault binary distribution. Please refer to the documentation
accompanying the backend's source in the Vault source tree.

- **High Availability** – the FoundationDB storage backend supports high
  availability. The HA implementation relies on the clocks of the Vault
  nodes inside the cluster being properly sychronized; clock skews are
  susceptible to cause contention on the locks.

- **Community Supported** – the FoundationDB storage backend is supported
  by the community. While it has undergone review by HashiCorp employees,
  they may not be as knowledgeable about the technology. If you encounter
  problems with them, you may be referred to the original author.

```hcl
storage "foundationdb" {
  api_version  = 510
  cluster_file = "/path/to/fdb.cluster"
  path         = "vault-top-level-directory"
  ha_enabled   = "true"
}
```

## `foundationdb` Parameters

- `api_version` `(int)` - The FoundationDB API version to use; this is a
  required parameter and doesn't have a default value. Future versions will
  impose a minimum API version to access newer features.

- `cluster_file` `(string)` - The path to the cluster file containing the
  connection data for the target cluster; this is a required parameter and
  doesn't have a default value.

- `path` `(string: "vault")` - The path of the top-level FoundationDB directory
  (using the directory layer) under which the Vault data will reside.

- `ha_enabled` `(string: "false")` - Whether or not to enable Vault
  high-availability mode using the FoundationDB backend.

## `foundationdb` tips

### Cluster file

The FoundationDB client expects to be able to update the cluster file at
runtime, to keep it current with changes happening to the cluster.

It does so by first writing a new cluster file alongside the current one,
then atomically renaming it into place.

This means the cluster file and the directory it resides in must be writable
by the user Vault is running as. You probably want to isolate the cluster
file into its own directory.

### Multi-version client

The FoundationDB client library version is tightly coupled to the server
version; during cluster upgrades, multiple server versions will be running
in the cluster, and the client must cope with that situation.

This is handled by the (primary) client library having the ability to load
a different version of the client library to connect to a particular server;
it is referred to as the [multi-version client][multi-ver-client] feature.

#### Client setup with `LD_LIBRARY_PATH`

If you do not use mlock, you can use `LD_LIBRARY_PATH` to point the linker at
the location of the primary client library.

```
$ export LD_LIBRARY_PATH=/dest/dir/for/primary:$LD_LIBRARY_PATH
$ export FDB_NETWORK_OPTION_EXTERNAL_CLIENT_DIRECTORY=/dest/dir/for/secondary
$ /path/to/bin/vault ...
```

#### Client setup with `RPATH`

When running Vault with mlock, the Vault binary must have capabilities set to
allow the use of mlock.

```
# setcap cap_ipc_lock=+ep /path/to/bin/vault
$ getcap /path/to/bin/vault
/path/to/bin/vault = cap_ipc_lock+ep
```

The presence of the capabilities will cause the linker to ignore
`LD_LIBRARY_PATH`, for security reasons.

In that case, we have to set an `RPATH` on the Vault binary at build time
to replace the use of `LD_LIBRARY_PATH`.

When building Vault, pass the `-r /dest/dir/for/primary` option to the Go
linker, for instance:

```
$ make dev FDB_ENABLED=1 LD_FLAGS="-r /dest/dir/for/primary "
```

(Note the trailing space in the variable value above).

You can verify `RPATH` is set on the Vault binary using `readelf`:

```
$ readelf -d /path/to/bin/vault | grep RPATH
 0x000000000000000f (RPATH)              Library rpath: [/dest/dir/for/primary]
```

With the client libraries installed:

```
$ ldd /path/to/bin/vault
...
    libfdb_c.so => /dest/dir/for/primary/libfdb_c.so (0x00007f270ad05000)
...
```

Now run Vault:

```
$ export FDB_NETWORK_OPTION_EXTERNAL_CLIENT_DIRECTORY=/dest/dir/for/secondary
$ /path/to/bin/vault ...
```

[foundationdb]: https://www.foundationdb.org
[multi-ver-client]: https://apple.github.io/foundationdb/api-general.html#multi-version-client-api
