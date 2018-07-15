drop schema if exists infect_sample_storage cascade;
create schema  if not exists infect_sample_storage;

set search_path to infect_sample_storage;





create table infect_sample_storage."dataSet" (
    id serial not null,
    identifier varchar(100) not null,
    created timestamp without time zone not null default now(),
    updated timestamp without time zone not null default now(),
    deleted timestamp without time zone,
    constraint "dataSet_pk"
        primary key (id),
    constraint "dataSet_unique_identifier"
        unique ("identifier")
);


create table infect_sample_storage."dataGroup" (
    id serial not null,
    "id_dataSet" int not null,
    identifier varchar(100) not null,
    created timestamp without time zone not null default now(),
    updated timestamp without time zone not null default now(),
    deleted timestamp without time zone,
    constraint "dataGroup_pk"
        primary key (id),
    constraint "dataGroup_unique_identifier"
        unique ("identifier"),
    constraint "dataGroup_fk_dataSet"
        foreign key ("id_dataSet")
        references "dataSet" ("id")
        on update cascade
        on delete restrict
);


create table infect_sample_storage."dataVersionStatus" (
    id serial not null,
    identifier varchar(100) not null,
    constraint "dataVersionStatus_pk"
        primary key (id),
    constraint "dataVersionStatus_unique_identifier"
        unique ("identifier")
);


create table infect_sample_storage."dataVersion" (
    id serial not null,
    "id_dataVersionStatus" int not null,
    "id_dataSet" int not null,
    version serial not null,
    description text null,
    identifier varchar(100) null,
    created timestamp without time zone not null default now(),
    updated timestamp without time zone not null default now(),
    deleted timestamp without time zone,
    constraint "dataVersion_pk"
        primary key (id),
    constraint "dataVersion_unique_identifier"
        unique ("identifier"),
    constraint "dataVersion_unique_version"
        unique ("version"),
    constraint "dataVersion_fk_dataVersionStatus"
        foreign key ("id_dataVersionStatus")
        references "dataVersionStatus" ("id")
        on update cascade
        on delete restrict,
    constraint "dataVersion_fk_dataSet"
        foreign key ("id_dataSet")
        references "dataSet" ("id")
        on update cascade
        on delete restrict
);


create table infect_sample_storage."data" (
    id serial not null,
    "id_dataVersion" int not null,
    "id_dataGroup" int ,
    "bacteriumId" int not null,
    "antibioticId" int not null,
    "ageGroupId" int not null,
    "regionId" int not null,
    "sampleDate" timestamp without time zone not null,
    "resistance" int not null,
    "sampleId" varchar(50) not null,
    constraint "data_pk"
        primary key (id),
    constraint "dataVersion_fk_dataVersion"
        foreign key ("id_dataVersion")
        references "dataVersion" ("id")
        on update cascade
        on delete restrict,
    constraint "data_fk_dataGroup"
        foreign key ("id_dataGroup")
        references "dataGroup" ("id")
        on update cascade
        on delete restrict
);




create table infect_sample_storage."dataSetField" (
    id serial not null,
    "id_dataSet" int ,
    "fieldName" varchar(200) not null,
    constraint "dataSetField_pk"
        primary key (id),
    constraint "dataSetField_unique_name"
        unique ("id_dataSet", "fieldName"),
    constraint "dataSetField_fk_dataSet"
        foreign key ("id_dataSet")
        references "dataSet" ("id")
        on update cascade
        on delete restrict
);




insert into "dataVersionStatus" ("identifier") values ('deleted');
insert into "dataVersionStatus" ("identifier") values ('active');
insert into "dataVersionStatus" ("identifier") values ('building');