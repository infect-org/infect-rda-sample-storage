
alter table infect_sample_storage."data" drop column "bacteriumId";
alter table infect_sample_storage."data" drop column "antibioticId";
alter table infect_sample_storage."data" drop column "ageGroupId";
alter table infect_sample_storage."data" drop column "regionId";
alter table infect_sample_storage."data" drop column "sampleDate";
alter table infect_sample_storage."data" drop column "resistance";
alter table infect_sample_storage."data" drop column "hospitalStatusId";
alter table infect_sample_storage."data" drop column "sampleId";


alter table infect_sample_storage."data" add column "data" JSONB;
alter table infect_sample_storage."data" add column "uniqueIdentifier" varchar(36);
alter table infect_sample_storage."data" add column "created" timestamp without time zone default now();


drop table infect_sample_storage."dataSetField";

insert into infect_sample_storage."dataVersionStatus" ("identifier") values ('preview');

alter table infect_sample_storage."sourceCode" rename column "identifier" to "specifier";
alter table infect_sample_storage."sourceCode" drop column "id_sourceCodeType";

drop table infect_sample_storage."sourceCodeType";


delete from infect_sample_storage."sourceCode" where true;

alter table infect_sample_storage."sourceCode" add constraint "sourceCode_unique_specifier" unique("specifier");
alter table infect_sample_storage."sourceCode" rename column "sourceCode" to "sourceText";


create table infect_sample_storage."sourceCode_dataSet" (
    id serial not null,
    "id_sourceCode" int not null,
    "id_dataSet" int not null,
    created timestamp without time zone not null default now(),
    updated timestamp without time zone not null default now(),
    constraint "sourceCode_dataSet_pk"
        primary key (id),
    constraint "dataVersion_unique_links"
        unique ("id_dataSet", "id_sourceCode"),
    constraint "sourceCode_dataSetfk_sourceCode"
        foreign key ("id_sourceCode")
        references infect_sample_storage."sourceCode" ("id")
        on update cascade
        on delete cascade,
    constraint "sourceCode_dataSet_fk_dataSet"
        foreign key ("id_dataSet")
        references infect_sample_storage."dataSet" ("id")
        on update cascade
        on delete cascade
);


create index "data_uniqueIdentifier_index"
    on infect_sample_storage.data ("uniqueIdentifier");