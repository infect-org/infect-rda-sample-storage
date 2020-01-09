
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