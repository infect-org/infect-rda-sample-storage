# Infect RDA Sample Storage Service

This service stores the data for RDA and the functions processing it in the RDA
compute nodes.


## Data Sets

RDA processes data based on data sets. A data set is a set of data, that is
separated from other data. There may be for exampl a data set for each tenant or
data sets for testing purposes.

A data set has a set of fields that are stored for it. Fields are properties of
data stored on each record of the data set. Fields may differ per data set. A
data set thus defines a schema for the data stored in it.


## Data Version

A data version are n records that were added to the storage at some time. Each
time data is imported into the storage, a version is created. Aversion belongs
to a data set. Versions have a status describing if it should be loaded into the
compute nodes for processing.


## Data groups

Data groups describe a set of records. They are used to distribute data fast to
the different compute nodes. Records are loaded in groups (data groups) into the
compute nodes. This is done by computing a [rendezvous
hashes](https://en.wikipedia.org/wiki/Rendezvous_hashing) for each group in
order to assign it to the shards (compute nodes) evenly in order to distribute
the load evenly.


## Shards

Shards are shards of data that are loaded into compute nodes. When a
cluster is created, it requests shards at the storage. Shards are made of data
groups which represent groups of records.