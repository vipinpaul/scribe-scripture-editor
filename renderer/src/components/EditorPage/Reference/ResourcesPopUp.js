/* eslint-disable no-nested-ternary */
import { StarIcon } from '@heroicons/react/outline';
import React, {
  useEffect, useRef, useState, Fragment, useContext,
} from 'react';
import PropTypes from 'prop-types';

import * as localforage from 'localforage';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, PlusCircleIcon } from '@heroicons/react/solid';
import { isElectron } from '@/core/handleElectron';
import { readRefMeta } from '@/core/reference/readRefMeta';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { writeCustomResources } from '@/core/reference/writeCustomResources';
import { readCustomResources } from '@/core/reference/readCustomResources';
import { SnackBar } from '@/components/SnackBar';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import DownloadSvg from '@/icons/basil/Outline/Files/Download.svg';
import RefreshSvg from '@/icons/basil/Outline/Interface/Refresh.svg';
import ResourceOption from './ResourceOption';
import ImportResource from './ImportResource';
import * as logger from '../../../logger';
import DownloadResourcePopUp from './ResourceUtils/DownloadResourcePopUp';
import DownloadCreateSBforHelps from './ResourceUtils/DownloadCreateSBforHelps';

function createData(name, language, owner) {
  return {
    name, language, owner,
  };
}
const translationNotes = [
  createData('English', 'en', 'Door43-catalog'),
  createData('Spanish', 'es-419', 'Es-419_gl'),
  createData('Hindi', 'hi', 'Door43-catalog'),
  createData('Bengali', 'bn', 'Door43-catalog'),
  createData('Malayalam', 'ml', 'Door43-catalog'),
  createData('Gujarati', 'gu', 'Door43-catalog'),
];
const translationWordLists = [
  createData('English', 'en', 'Door43-catalog'),
  createData('Spanish', 'es-419', 'es-419_gl'),
];
const translationQuestions = [
  createData('English', 'en', 'Door43-catalog'),
  createData('Spanish', 'es-419', 'es-419_gl'),
];
const translationAcademys = [
  createData('English', 'en', 'Door43-catalog'),
];
const obsTranslationNotes = [
  createData('Spanish', 'es-419', 'Door43-catalog'),
  createData('English', 'en', 'Door43-catalog'),
];
const obsTranslationQuestions = [
  createData('Spanish', 'es-419', 'Door43-catalog'),
  createData('English', 'en', 'Door43-catalog'),
];

const ResourcesPopUp = ({
  header,
  // languageId,
  openResourcePopUp,
  setOpenResourcePopUp,
  selectedResource,
  setReferenceResources,
}) => {
  const cancelButtonRef = useRef(null);
  const [subMenuItems, setSubMenuItems] = useState();
  const [title, setTitle] = useState(header);
  const [selectResource, setSelectResource] = useState(selectedResource);
  const [showInput, setShowInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [error, setError] = useState('');
  // const [translationNote, setTranslationNote] = useState(translationNotes);
  // const [translationQuestion, setTranslationQuestion] = useState(translationQuestions);
  const [translationWordList, settranslationWordList] = useState(translationWordLists);
  // const [translationAcademy, setTranslationAcademy] = useState(translationAcademys);
  const [translationNote, setTranslationNote] = useState([]);
  const [translationQuestion, setTranslationQuestion] = useState([]);
  const [translationAcademy, setTranslationAcademy] = useState([]);
  const [obsTranslationNote, setObsTranslationNote] = useState([]);
  const [obsTranslationQuestion, setObsTranslationQuestion] = useState([]);

  const [loading, setLoading] = useState(false);
  const [resourceIconClick, setResourceIconClick] = useState(false);
  const { t } = useTranslation();
  const {
    states: {
      username,
    },
  } = useContext(ProjectContext);

  const {
    state: {
      openImportResourcePopUp,
    },
    actions: {
      openResourceDialog,
      setOpenImportResourcePopUp,
    },
  } = useContext(ReferenceContext);

  useEffect(() => {
    if (isElectron()) {
      const fs = window.require('fs');
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      fs.mkdirSync(path.join(newpath, 'autographa', 'users', username, 'resources'), {
        recursive: true,
      });
      const projectsDir = path.join(newpath, 'autographa', 'users', username, 'resources');
      const parseData = [];
      readRefMeta({
        projectsDir,
      }).then((refs) => {
        refs.forEach((ref) => {
          const metaPath = path.join(newpath, 'autographa', 'users', username, 'resources', ref, 'metadata.json');
          readRefBurrito({
            metaPath,
          }).then((data) => {
            if (data) {
              const burrito = {};
              burrito.projectDir = ref;
              burrito.value = JSON.parse(data);
              parseData.push(burrito);
              localforage.setItem('resources', parseData).then(
                () => localforage.getItem('resources'),
              ).then((res) => {
                setSubMenuItems(res);
              }).catch((err) => {
                // we got an error
                throw err;
              });
            }
          });
        });
      });

      fs.mkdirSync(path.join(newpath, 'autographa', 'common', 'resources'), {
        recursive: true,
      });
      const commonResourceDir = path.join(newpath, 'autographa', 'common', 'resources');

      readRefMeta({
        projectsDir: commonResourceDir,
      }).then((refs) => {
        refs.forEach((ref) => {
          const metaPath = path.join(newpath, 'autographa', 'common', 'resources', ref, 'metadata.json');
          readRefBurrito({
            metaPath,
          }).then((data) => {
            if (data) {
              const burrito = {};
              burrito.projectDir = ref;
              burrito.value = JSON.parse(data);
              parseData.push(burrito);
              localforage.setItem('resources', parseData).then(
                () => localforage.getItem('resources'),
              ).then((res) => {
                setSubMenuItems(res);
              }).catch((err) => {
                // we got an error
                throw err;
              });
            }
          });
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSection = () => {
    setOpenResourcePopUp(false);
    setTranslationNote('');
    setTranslationQuestion('');
    settranslationWordList('');
    setTranslationAcademy('');
  };

  const handleRowSelect = (e, row, name, owner, offline = false) => {
    const offlineResource = offline
    ? { offline: true, data: offline }
    : { offline: false };
    setReferenceResources({
      selectedResource: selectResource,
      languageId: row,
      refName: name,
      header: title,
      owner,
      offlineResource,
    });
    // setOwner(owner);
    removeSection();
  };

  const [isOpenDonwloadPopUp, setIsOpenDonwloadPopUp] = useState(false);

  const openResourceDialogBox = () => {
    // if (selectResource === 'bible') {
    //   logger.debug('DownloadResourcePopUp.js', 'Calling bible resource pop up');
    //   setIsOpenDonwloadPopUp(true);
    // } else {
    //   setOpenImportResourcePopUp(true);
    //   openResourceDialog();
    // }
    if (selectResource === 'bible' || selectResource === 'obs') {
        logger.debug('DownloadResourcePopUp.js', 'Calling bible resource pop up');
        setIsOpenDonwloadPopUp(true);
      }
  };

  function closeImportPopUp() {
    setOpenImportResourcePopUp(false);
  }

  function handleCustomInput(url, key, resourceName) {
    logger.debug('ResourcePopUp.js', 'Open handleCustomInput function to add write custom resource url');
    const resourceId = url.split('/');
    if (((resourceId[resourceId.length - 1].split('_')[1]) === (key === 'twlm' ? 'tw' : key)) && url && resourceName) {
      removeSection();
      writeCustomResources({ resourceUrl: { key, url, resourceName } }).then(() => {
        setOpenSnackBar(true);
        setError('success');
        setSnackText(t('dynamic-msg-resource-added'));
        setOpenResourcePopUp(true);
        setInputUrl('');
        setResourceName('');
        setSelectResource(key);
      });
      setShowInput(false);
    } else {
      logger.error('ResourcePopUp.js', 'Error in adding custom resource url');
      setOpenSnackBar(true);
      setInputUrl('');
      setResourceName('');
      setError('failure');
      setShowInput(false);
      setSnackText(t('dynamic-msg-resource-unable-fetch-url'));
    }
  }

  useEffect(() => {
    readCustomResources({ resourceId: 'tq', translationData: translationQuestion });
    readCustomResources({ resourceId: 'twlm', translationData: translationWordList });
    readCustomResources({ resourceId: 'tn', translationData: translationNote });
    readCustomResources({ resourceId: 'ta', translationData: translationAcademy });
    readCustomResources({ resourceId: 'obs-tn', translationData: obsTranslationNote });
    readCustomResources({ resourceId: 'obs-tq', translationData: obsTranslationQuestion });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInput]);

  const fetchTranslationResource = async (urlpath, setResource) => {
    logger.debug('ResourcesPopUp.js', `fetchTranslationResource :  ${selectResource}`);
    const baseUrl = 'https://git.door43.org/api/catalog/v5/search?';
    if (urlpath) {
      const resourceData = [];
      await fetch(`${baseUrl}subject=${urlpath}`)
      .then((res) => res.json())
      .then((response) => {
        response.data.forEach(async (data) => {
          const createdData = createData(data.language_title, data.language, data.owner);
          createdData.responseData = data;
          resourceData.push(createdData);
        });
        if (resourceData.length === response.data.length) {
          setResource(resourceData);
        }
      }).catch((err) => {
        console.log('error in fetch resource : ', err);
        logger.debug('ResourcesPopUp.js', `fetchTranslationResource Error ${selectResource} :  ${err}`);
      });
    }
  };

  useEffect(() => {
    (async () => {
      console.log('resource : ', selectResource);
      logger.debug('ResourcesPopUp.js', `get available selected resources ${selectResource}`);
      setLoading(true);
      switch (selectResource) {
        case 'tn':
            await fetchTranslationResource('TSV Translation Notes', setTranslationNote);
            // console.log('get content : ', translationNote);
          break;
        // case 'twlm':
        //   await fetchTranslationResource('Translation Words', settranslationWordList);
        //   // console.log('get content : ', translationWordList);
        //   break;
        case 'tq':
          await fetchTranslationResource('Translation Questions', setTranslationQuestion);
          // console.log('get content : ', translationQuestion);
        break;
        case 'obs-tn':
          await fetchTranslationResource('OBS Translation Notes', setObsTranslationNote);
          // console.log('get content : ', obsTranslationNote);
        break;
        case 'obs-tq':
          await fetchTranslationResource('OBS Translation Questions', setObsTranslationQuestion);
          // console.log('get content : ', obsTranslationQuestion);
        break;
        case 'ta':
          await fetchTranslationResource('Translation Academy', setTranslationAcademy);
          // console.log('get content : ', translationAcademy);
        break;

          default:
            break;
          }
        setLoading(false);
        })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectResource]);

  const handleDownloadHelpsResources = async (event, reference) => {
    console.log('clicked download : ', reference);
    await DownloadCreateSBforHelps(reference?.responseData);
  };

  const callResource = (resource) => {
    logger.debug('ResourcesPopUp.js', 'Displaying resource table');
    console.log('selected resource ==== : ', resource);
    const resources = [
      { id: 'tn', title: t('label-resource-tn'), resource: translationNote },
      { id: 'twlm', title: t('label-resource-twl'), resource: translationWordList },
      { id: 'tq', title: t('label-resource-tq'), resource: translationQuestion },
      { id: 'ta', title: t('label-resource-ta'), resource: translationAcademy },
      { id: 'obs-tn', title: t('label-resource-obs-tn'), resource: obsTranslationNote },
      { id: 'obs-tq', title: t('label-resource-obs-tq'), resource: obsTranslationQuestion }];
    const reference = resources.find((r) => r.id === resource);
    // console.log('selected referecne === : ', reference);
    // console.log('sub menu item -------: ', subMenuItems);
    const offlineResource = subMenuItems ? subMenuItems?.filter((item) => item?.value?.agOffline && item?.value?.dublin_core?.identifier === resource) : [];
    // console.log('offline  items from submenu >>>>>: ', offlineResource);
    return (
      resource
      && loading ? <LoadingScreen />
      : resource && (
        <tbody className="bg-white ">
          {/* offline resources head */}
          {offlineResource.length > 0 && (
            <tr className="">
              <td colSpan="3" className="p-4 text-sm text-gray-900 font-bold">
                {' '}
                Downloaded Resources
                {' '}
                <hr />
              </td>
            </tr>
          )}
          {/* offline resources body */}
          {offlineResource.length > 0 && offlineResource.map((resource) => (
            <>
              <tr className="hover:bg-gray-200" id={resource?.projectDir} key={resource.value.meta.id + resource.value.meta.language}>
                <td className="p-4 text-sm text-gray-600">
                  <div
                    className="focus:outline-none"
                    onClick={(e) => handleRowSelect(e, resource?.value?.meta?.language, `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`, resource?.value?.meta?.owner, resource)}
                    role="button"
                    tabIndex="0"
                  >
                    {`${resource?.value?.meta?.name} (${resource?.value?.meta?.owner})`}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <div
                    className="focus:outline-none"
                    onClick={(e) => handleRowSelect(e, resource?.value?.meta?.language, `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`, resource?.value?.meta?.owner, resource)}
                    role="button"
                    tabIndex="0"
                  >
                    {resource?.value?.meta?.language}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600 ">
                  <div
                    className="text-xs cursor-pointer focus:outline-none"
                    role="button"
                    tabIndex={0}
                    title="check updates"
                    // onClick={(e) => handleDownloadHelpsResources(e, notes)}
                  >
                    <RefreshSvg
                      fill="currentColor"
                      className="w-6 h-6"
                    />
                  </div>
                </td>
              </tr>
              <td colSpan={3}>
                {' '}
                <hr className="border-4 rounded-md" />
              </td>
            </>
          ))}

          {/* online resources section */}
          {(reference.resource).map((notes) => (
            <tr className="hover:bg-gray-200" id={notes.name} key={notes.name + notes.owner}>
              <td className="px-5 py-3 hidden">
                <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, notes.language, `${reference.title} ${notes.name}`, notes.owner)}
                  role="button"
                  tabIndex="0"
                >
                  {`${notes.name} (${notes.owner})`}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, notes.language, `${reference.title} ${notes.name}`, notes.owner)}
                  role="button"
                  tabIndex="0"
                >
                  {notes.language}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="text-xs cursor-pointer focus:outline-none"
                  role="button"
                  tabIndex={0}
                  title="download"
                  onClick={(e) => handleDownloadHelpsResources(e, notes)}
                >
                  <DownloadSvg
                    fill="currentColor"
                    className="w-6 h-6"
                  />
                </div>
              </td>
            </tr>
        ))}
        </tbody>
      )
    );
  };

  const importResources = (resource) => {
    if (showInput) {
      return (
        <div className="bg-white grid grid-cols-4 gap-2 p-4 text-sm text-left tracking-wide">
          <div className="flex gap-5 col-span-2">
            <div>
              <input
                type="text"
                name={t('label-resource-name')}
                id=""
                value={resourceName}
                placeholder={t('placeholder-resource-name')}
                onChange={(e) => setResourceName(e.target.value)}
                className="bg-white w-52 ml-2 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
              />
            </div>
            <div>
              <input
                type="text"
                name={t('label-location')}
                id=""
                value={inputUrl}
                placeholder={t('placeholder-door43-url')}
                onChange={(e) => setInputUrl(e.target.value)}
                className="bg-white w-52 ml-2 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleCustomInput(inputUrl, resource, resourceName)}
                title={t('btn-load-tn')}
                className="py-2 m-1 px-6 bg-primary rounded shadow text-white uppercase text-xs tracking-widest font-semibold"
              >
                {t('btn-import')}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <button type="button" className="flex gap-6 mx-5 absolute bottom-5 right-0 justify-end z-10 outline-none">
        <PlusCircleIcon title={t('label-upload')} className="h-10 w-10 m-5 text-primary" onClick={() => setShowInput(true)} aria-hidden="true" />
      </button>
    );
  };

  return (
    <>
      <Transition
        show={openResourcePopUp}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          static
          open={openResourcePopUp}
          onClose={removeSection}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">
            <div className="w-8/12 h-4/6 items-center justify-center m-auto z-50 shadow overflow-hidden rounded">
              <div className="h-full flex relative rounded shadow overflow-hidden bg-white">
                <button
                  aria-label="close-resources"
                  type="button"
                  onClick={removeSection}
                  className="p-2 focus:outline-none bg-black absolute z-10 b top-0 right-0"
                >
                  <XIcon className="h-4 w-4 text-white" />
                </button>
                <div>
                  <div aria-label="resources-title" className="uppercase bg-secondary text-white p-2 text-xs tracking-widest leading-snug rounded-tl text-center">
                    {t('label-resource')}
                  </div>
                  <div style={{ width: 'max-content' }} className="relative bg-gray-100 px-3 py-3 h-full overflow-auto scrollbars-width">
                    {/* <input
                    className="rounded h-8 bg-gray-200 border-none uppercase pr-6 text-xs
                      tracking-widest leading-snug font-bold"
                    placeholder="Search"
                    type="search"
                    id="gsearch"
                    name="gsearch"
                    /> */}
                    <div className="grid grid-rows-5 py-5 gap-4">
                      <ResourceOption
                        imageUrl="/illustrations/bible-icon.svg"
                        id="bible"
                        text={t('label-resource-bible')}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dictionary-icon.svg"
                        id="tn"
                        text={t('label-resource-tn')}
                        translationData={translationNotes}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/image-icon.svg"
                        id="twlm"
                        text={t('label-resource-twl')}
                        translationData={translationWordLists}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dialogue-icon.svg"
                        id="tq"
                        text={t('label-resource-tq')}
                        translationData={translationQuestions}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/bible-icon.svg"
                        id="ta"
                        text={t('label-resource-ta')}
                        translationData={translationAcademys}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/image-icon.svg"
                        id="obs"
                        text={t('label-resource-obs')}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dictionary-icon.svg"
                        id="obs-tn"
                        text={t('label-resource-obs-tn')}
                        translationData={obsTranslationNotes}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dialogue-icon.svg"
                        id="obs-tq"
                        text={t('label-resource-obs-tq')}
                        translationData={obsTranslationQuestions}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      {/* <ResourceOption
                      imageUrl="/illustrations/location-icon.svg"
                      id="map"
                      text="Map"
                      setSelectResource={setSelectResource}
                      setTitle={setTitle}
                      setSubMenuItems={setSubMenuItems}
                    />
                    <ResourceOption
                      imageUrl="/illustrations/dialogue-icon.svg"
                      id="cmtry"
                      text="Commentary"
                      setSelectResource={setSelectResource}
                      setTitle={setTitle}
                      setSubMenuItems={setSubMenuItems}
                    /> */}
                    </div>
                  </div>
                </div>
                {loading
                  ? <LoadingScreen />
                  : (
                    <div className="relative w-full max-h-sm scrollbars-width overflow-auto ">
                      <table className="border-separate border-spacing-0 w-full">
                        <thead className="bg-white">
                          <tr className="text-sm text-left">
                            <th className="px-5 py-3 font-medium text-gray-300 hidden">
                              <StarIcon className="h-5 w-5" aria-hidden="true" />
                            </th>
                            <th className="px-5 py-3.5 font-bold w-9/12 text-gray-700 uppercase tracking-wider">
                              {t('label-name')}
                            </th>
                            <th className="px-5 py-3.5 font-bold w-3/12 text-gray-700 uppercase tracking-wider">
                              {t('label-language')}
                            </th>
                          </tr>
                        </thead>

                        {selectResource === 'bible' ? (
                          <tbody className="bg-white">
                            {(subMenuItems) && (
                          subMenuItems.map((ref) => (ref?.value?.type?.flavorType?.name === 'scripture'
                          && (
                            <tr className="hover:bg-gray-200" key={ref.value.identification.name.en + ref.projectDir}>
                              <td className="px-5 py-3 hidden">
                                <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                <div
                                  className="focus:outline-none"
                                  onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    )}
                                  role="button"
                                  tabIndex="0"
                                >
                                  {ref.value.identification.name.en}
                                  {' '}
                                  (
                                  {ref.projectDir}
                                  )
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                <div
                                  className="focus:outline-none"
                                  onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                  )}
                                  role="button"
                                  tabIndex="0"
                                >
                                  {ref.value.languages[0].name.en}
                                </div>
                              </td>
                            </tr>
                          )
                          ))
                        )}
                          </tbody>
                    ) : selectResource !== 'obs' && callResource(selectResource)}
                        {selectResource === 'obs' && (
                          <tbody className="bg-white">
                            {(subMenuItems) && (
                          subMenuItems.map((ref) => (ref?.value?.type?.flavorType?.name === 'gloss'
                          && (
                          <tr className="hover:bg-gray-200" key={ref.value.identification.name.en + ref.projectDir}>
                            <td className="px-5 py-3 hidden">
                              <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref.value.identification.name.en}
                                {' '}
                                (
                                {ref.projectDir}
                                )
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref.value.languages[0].name.en}
                              </div>
                            </td>
                          </tr>
                          )
                          ))
                        )}
                          </tbody>
                    ) }
                      </table>

                      {selectResource === 'bible' || selectResource === 'obs' ? (
                        <button type="button" className="flex gap-6 mx-5 absolute bottom-5 right-0 justify-end z-10 outline-none">
                          {resourceIconClick
                              && (
                              <div className="flex-col absolute bottom-14 right-7 justify-end text-white">
                                <button
                                  type="button"
                                  className="bg-primary  mb-2 w-44 p-1 border-none rounded-md hover:bg-secondary"
                                  tabIndex={-3}
                                  onClick={() => { openResourceDialogBox(); setResourceIconClick(!resourceIconClick); }}
                                >
                                  Resource Collections
                                </button>
                                <button
                                  type="button"
                                  className="bg-primary  mb-2 w-44 p-1 border-none rounded-md hover:bg-secondary"
                                  tabIndex={-2}
                                  onClick={() => { setOpenImportResourcePopUp(true); openResourceDialog(); setResourceIconClick(!resourceIconClick); }}
                                >
                                  Custom Resource
                                </button>
                              </div>
                            )}
                          <PlusCircleIcon className="h-10 w-10 m-5 text-primary" onClick={() => setResourceIconClick(!resourceIconClick)} />
                          { (selectResource === 'bible' || selectResource === 'obs')
                          && (
                          <ImportResource
                            open={openImportResourcePopUp}
                            closePopUp={closeImportPopUp}
                            openPopUp={setOpenImportResourcePopUp}
                            setOpenResourcePopUp={setOpenResourcePopUp}
                            setLoading={setLoading}
                          />
                          ) }
                        </button>
                  ) : importResources(selectResource)}

                      {isOpenDonwloadPopUp
                  && (
                  <DownloadResourcePopUp
                    selectResource={selectResource}
                    isOpenDonwloadPopUp={isOpenDonwloadPopUp}
                    setIsOpenDonwloadPopUp={setIsOpenDonwloadPopUp}
                  />
                  )}
                    </div>
                  )}
              </div>

            </div>

          </div>
        </Dialog>
      </Transition>

      <SnackBar
        openSnackBar={openSnackBar}
        setOpenSnackBar={setOpenSnackBar}
        snackText={snackText}
        setSnackText={setSnackText}
        error={error}
      />
    </>
  );
};

export default ResourcesPopUp;

ResourcesPopUp.propTypes = {
  header: PropTypes.string,
  openResourcePopUp: PropTypes.bool,
  setOpenResourcePopUp: PropTypes.func,
  selectedResource: PropTypes.string,
  setReferenceResources: PropTypes.func,

};
