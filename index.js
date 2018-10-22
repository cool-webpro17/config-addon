// import { twigFunctions } from '../.storybook/helpers/TwigFunctions';
import pathParse from 'path-parse';

export const AddStories = (templateFiles, templateData) => {

  templateFiles.keys().forEach(pathName => {
    let dir = pathParse(pathName).dir.split('/').pop();
    const name = pathParse(pathName).name;

    if (!templateData) {
      storiesOf(dir, module)
        .add(name, () => templateFiles(pathName));
      return;
    }

    const extPos = pathName.lastIndexOf('.');
    const jsonFilename = pathName.substr(0, extPos < 0 ? path.length : extPos) + ".json";
    let data = [];

    if (templateData.keys().indexOf(jsonFilename) >=  0) {
      data = templateData(jsonFilename);
    }
    // Import any files specified in the root `@import` property
    if (data['@import']) {
      Object.keys(data['@import']).forEach(function(key) {
        const pathName = data['@import'][key];
        const subData = {};
        subData[key] = templateData('./' + pathName);
        data = Object.assign({}, subData, data);
      });

      Object.keys(data).map(key => {
        Object.keys(twigFunctions).map(name => {
          if (key === name) {
            data[key] = twigFunctions[name];
          }
        })
      });

      const template = templateFiles(pathName);
      const html = template(data);

      if (dir === '.') dir = 'root';
      storiesOf(dir, module)
        .add(name, () => html);
    }
  });
}

export const asset = value => {
  const manifest = require('../../public/build/manifest.json');
  const assetUrl = manifest[value];
  
  if (assetUrl)
    return assetUrl;
  return value;
}

export const path = (value, data) => {
  const storyIndex = value.substring(value.lastIndexOf('_') + 1);
  const pathName = value.substring(0, value.lastIndexOf('_'));
  const storyName = pathName.substring(pathName.lastIndexOf('_') + 1);

  if (storyName && storyIndex) {
    return `?selectedKind=${storyName}&selectedStory=${storyIndex}.html`;
  }
  return '#';
}

export const csrf_token = value => {
  return value + "token";
}

export const twigFunctions = {
  "asset": asset,
  "path": path,
  "csrf_token": csrf_token,
}