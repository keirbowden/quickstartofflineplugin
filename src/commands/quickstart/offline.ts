import {core, SfdxCommand, flags} from '@salesforce/command';
import {fs} from '@salesforce/core';
const path = require("path");

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('quickstartoffline', 'org');

export default class Template extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx quickstart:offline --sobjecttype Account --fields Industry,
  Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  My hub org id is: 00Dxx000000001234
  `,
  `$ sfdx hello:org --name myname --targetusername myOrg@example.com
  Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    sobjecttype: flags.string({char: 's', description: messages.getMessage('sobjectTypeFlagDescription')}),
    fields: flags.string({char: 'f', description: messages.getMessage('fieldsFlagDescription')}),
    destdir: flags.string({char: 'd', description: messages.getMessage('destdirFlagDescription')})
  };

  public async run(): Promise<any> { // tslint:disable-line:no-any
    const dirName = this.flags.destdir || '.';

    if (!this.flags.sobjecttype) {
        this.flags.sobjecttype = await this.ux.prompt('SObject type');
    }
    if (!this.flags.fields) {
      this.flags.fields = await this.ux.prompt('Fields (comma separated list of names)');
    }


    const fields=this.convertCommaSepStringToJSONArrayString(this.flags.fields);

    // find the plugin root
    const pluginRoot=await fs.traverseForFile(__dirname, 'package.json');
    console.log('Plugin root = '+ pluginRoot);
    const templateDirName=path.join(pluginRoot, 'templates', 'OfflineMobile');
    console.log('Looking for ' + templateDirName);
    try {
      await fs.stat(templateDirName);
    }
    catch (err) {
      if (err && err.code === 'ENOENT') {
        throw new Error('No template found for ' + this.flags.type);
      }
      else throw err;
    }
    
    await this.createDirectoryContents(templateDirName, dirName);
    // Return an object to be displayed with --json
    return {};
  }

  private async createDirectoryContents (templatePath, newProjectPath) {
    //this.ux.log('Creating directory contents, templatePath = ' + templatePath + ', new project path = ' + newProjectPath);
//    const fs = require("fs");
    const filesToCreate = await fs.readdir(templatePath);
    const fsOrig=require('fs');
  
    filesToCreate.forEach(async file => {
      const origFilePath = `${templatePath}/${file}`;
      
      // get stats about the current file
      const stats = await fs.stat(origFilePath);
  
      if (stats.isFile()) {
        if (file=='config.js') {
          this.ux.log('Replacing tokens in ' + file);
          let contents = await fs.readFile(origFilePath, 'utf8');

          const fields=this.convertCommaSepStringToJSONArrayString(this.flags.fields);

          contents=contents.replace('QS_SOBJECT_TYPE', JSON.stringify(this.flags.sobjecttype))
                           .replace('QS_FIELDS', fields);
          const newFilePath = `${newProjectPath}/${file}`;
          await fs.writeFile(newFilePath, contents, 'utf8');
        }
        else {
          this.ux.log('Copying ' + file);
          fsOrig.copyFileSync(origFilePath, path.join(newProjectPath, file));
        }
      } 
      else if (stats.isDirectory()) {
        this.ux.log('Creating dir ' + path.join(newProjectPath, file));
        try {
          const dirStats = await fs.stat(path.join(newProjectPath, file));
        }
        catch (err) {
          await fs.mkdirp(`${newProjectPath}/${file}`);
        }
        
        // recursive call
        await this.createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
      }
    });
  }

  private convertCommaSepStringToJSONArrayString(commaSepStrin) {
    const eles=this.flags.fields.split(',');
    let arr=[];
    for (let idx=0; idx<eles.length; idx++) {
      arr.push(eles[idx]);
    }

    return JSON.stringify(arr);
  }
}
