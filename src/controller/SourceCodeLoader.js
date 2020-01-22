import { Controller } from '@infect/rda-service';
import type from 'ee-types';
import log from 'ee-log';
import fs from 'fs';
import path from 'path';

const { promises: { readdir, readFile, stat } } = fs; 




export default class SourceCodeLoaderController extends Controller {


    constructor({db}) {
        super('source-code-loader');

        this.db = db;
        this.enableAction('list');
        this.enableAction('create');
        this.enableAction('update');
    }


    /**
    * add source code to dataset 
    */
    async update(request) {
        const dataSetIdentifier = request.getParameter('id');

        const dataSet = await this.db.dataSet('*', {
            identifier: dataSetIdentifier,
        }).findOne();

        if (!dataSet) {
            return await request.response().status(404).send({
                status: `Cannot map source to dataSet ${dataSetIdentifier}. DataSet not found!`
            });
        } else {
            const sourceCodeFiles = await this.db.sourceCode(['id', 'specifier']).getDataSet('*').find();
            const result = {
                added: [],
                mapped: [],
            };

            for (const sourceCode of sourceCodeFiles) {
                if (!sourceCode.dataSet || !sourceCode.dataSet.some(ds => ds.id === dataSet.id)) {
                    sourceCode.dataSet.push(dataSet);
                    await sourceCode.save();
                    result.added.push(sourceCode.specifier);
                } else {
                    result.mapped.push(sourceCode.specifier);
                }
            }

            await request.response().status(200).send(result);
        }
    }




    /**
    * add source code to the db
    */
    async create(request) {
        const sourceDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../../compute-source-code');
        const files = await this.loadFiles(sourceDir);
        const result = {
            added: [],
            updated: [],
        };

        for (const [ filename, sourceText ] of files.entries()) {
            const relativePath = filename.substring(sourceDir.length + 1);

            const dbFile = await this.db.sourceCode({
                specifier: relativePath,
            }).findOne();

            if (dbFile) {
                dbFile.sourceText = sourceText;
                await dbFile.save();
                result.updated.push(relativePath);
            } else {
                await new this.db.sourceCode({
                    specifier: relativePath,
                    sourceText,
                }).save();
                result.added.push(relativePath);
            }
        }

        request.response().status(201).send({
            files: result,
        });
    }



    /**
     * Loads files.
     *
     * @param      {string}   storagePath  The storage path
     * @param      {map}      storageMap   The storage map
     */
    async loadFiles(storagePath, storageMap = new Map()) {
        const files = await readdir(storagePath);

        for (const file of files) {
            const filename = path.join(storagePath, file);
            const stats = await stat(filename);

            if (stats.isFile()) {
                const sourceText = await readFile(filename);
                storageMap.set(filename, sourceText.toString());
            } else if (stats.isDirectory()) {
                await this.loadFiles(filename, storageMap);
            }
        }

        return storageMap;
    }
}