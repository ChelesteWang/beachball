import { tagPackages, tagDistTag } from '../../publish/tagPackages';
import { generateTag } from '../../tag';
import { BumpInfo } from '../../types/BumpInfo';
import { gitFailFast } from 'workspace-tools';

jest.mock('workspace-tools', () => ({
  gitFailFast: jest.fn(),
}));

const createTagParameters = (tag: string, cwd: string) => {
  return [['tag', '-a', '-f', tag, '-m', tag], { cwd }];
};

const noTagBumpInfo = {
  calculatedChangeInfos: {
    foo: 'minor',
    bar: 'major',
  },
  packageInfos: {
    foo: {
      name: 'foo',
      version: '1.0.0',
      combinedOptions: {
        gitTags: false,
      },
    },
    bar: {
      name: 'bar',
      version: '1.0.1',
      combinedOptions: {
        gitTags: false,
      },
    },
  },
  modifiedPackages: new Set(['foo', 'bar']),
  newPackages: new Set(),
} as unknown as BumpInfo;

const oneTagBumpInfo = {
  calculatedChangeInfos: {
    foo: 'minor',
    bar: 'major',
  },
  packageInfos: {
    foo: {
      name: 'foo',
      version: '1.0.0',
      combinedOptions: {
        gitTags: true,
      },
    },
    bar: {
      name: 'bar',
      version: '1.0.1',
      combinedOptions: {
        gitTags: false,
      },
    },
  },
  modifiedPackages: new Set(['foo', 'bar']),
  newPackages: new Set(),
} as unknown as BumpInfo;

beforeEach(() => {
  (gitFailFast as jest.Mock).mockReset();
});

describe('tagPackages', () => {
  it('createTag is not called for packages without gitTags', () => {
    tagPackages(noTagBumpInfo, /* cwd*/ '');
    expect(gitFailFast).not.toHaveBeenCalled();
  });

  it('createTag is called for packages with gitTags', () => {
    tagPackages(oneTagBumpInfo, /* cwd*/ '');
    expect(gitFailFast).toHaveBeenCalledTimes(1);

    // verify git is being called to create new auto tag for foo and bar
    const newFooTag = generateTag('foo', oneTagBumpInfo.packageInfos['foo'].version);
    expect(gitFailFast).toHaveBeenCalledWith(...createTagParameters(newFooTag, ''));
  });
});

describe('tagDistTag', () => {
  it('createTag is not called for an empty dist tag', () => {
    tagDistTag(/* tag */ '', /* cwd*/ '');
    expect(gitFailFast).not.toHaveBeenCalled();
  });

  it('createTag is called for unique dist tags', () => {
    tagDistTag(/* tag */ 'abc', /* cwd*/ '');
    expect(gitFailFast).toBeCalledTimes(1);
    expect(gitFailFast).toHaveBeenCalledWith(...createTagParameters('abc', ''));
  });
});
