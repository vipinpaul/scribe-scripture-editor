import { useEffect, useState, useContext } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { Button } from '@mui/base';
import { Modal } from '@mui/material';
import { ProjectContext } from '@/components/context/ProjectContext';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
// eslint-disable-next-line
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker.tsx';
import { ModalSectionSelection } from './modalSectionSelection';
import { FieldPicker } from './fieldPicker/FieldPicker';

const convertionWrapperType = (type) => {
  if (type === 'obsWrapper') {
    return 'OBS';
  }
  if (type === 'bcvWrapper') {
    return 'book';
  }
};

const hashPrintTypes = {
  bcvBible: 'Bible by verse',
  bookNote: 'Book Note',
  '4ColumnSpread': 'Four resources on facing pages',
  '2Column': 'Two resources in two columns',
  biblePlusNotes: 'Notes focus (by verse)',
  paraBible: 'Formatted Bible',
  markdown: 'Simple formatting',
  // jxlSpread: 'Juxtalinear on facing pages',
  jxlSimple: 'Juxtalinear',
  obs: 'Obs',
  obsPlusNotes: 'Obs with Notes',
};

export function AccordionPicker({
  language,
  setSelected,
  keySpecification,
  idjson,
  projectInfo,
  removeButton,
  advanceMode,
  wrapperType,
  doReset,
}) {
  const {
    states: { listResourcesForPdf },
  } = useContext(ProjectContext);
  const jsonSpec = global.PdfGenStatic.handlerInfo();
  const [title, setTitle] = useState(projectInfo.name);
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [testForRefresh, setTestForRefresh] = useState(null);

  useEffect(() => {
    setTestForRefresh(null);
  }, [keySpecification]);
  useEffect(() => {
    if (!testForRefresh) {
      setTestForRefresh(jsonSpec[keySpecification]);
    }
  }, [keySpecification, testForRefresh]);

  const handleInputSearch = (e) => {
    setSearchText(e.target.value);
  };
  const [localListResourcesForPdf, setLocalListResourcesForPdf] = useState({
    [convertionWrapperType(wrapperType)]:
      listResourcesForPdf[convertionWrapperType(wrapperType)],
  });
  const handleOpenModal = (isOpen) => {
    setOpenModal(isOpen);
    setSearchText('');
  };
  useEffect(() => {
    if (searchText.length > 2) {
      const contentTypes = Object.keys(listResourcesForPdf);
      const newListResources = contentTypes.reduce(
        (a, v) => ({ ...a, [v]: {} }),
        {},
      );
      const regexSearch = new RegExp(`.*${searchText}.*`, 'i');
      let entries;
      contentTypes.forEach((contentType) => {
        entries = Object.entries(listResourcesForPdf[contentType]).sort();
        // eslint-disable-next-line
        for (const [pathKey, val] of entries) {
          if (
            regexSearch.test(
              pathKey.replace('[', '').replace(']', ''),
            )
          ) {
            newListResources[contentType][pathKey] = val;
          }
        }
      });
      setLocalListResourcesForPdf(newListResources);
    } else {
      setLocalListResourcesForPdf({
        [convertionWrapperType(wrapperType)]:
          listResourcesForPdf[convertionWrapperType(wrapperType)],
      });
    }
  }, [searchText, setSearchText, openModal, setOpenModal]);

  const [open, setOpen] = useState(true);
  const [jsonSpecEntry, setJsonSpecEntry] = useState('{}');
  const [openModalSectionSelection, setOpenModalSectionSelection] = useState(false);
  const listChoiceSectionByWrapper = require('./fieldPicker/WrapperSection.json')[wrapperType].advance[
    advanceMode
  ];

  const handleAccordionChange = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    // Update selected state when the jsonSpecEntry changes
    setSelected((prevSelected) => {
      const updatedSelected = { ...JSON.parse(prevSelected) };
      if (updatedSelected[idjson]) {
        if (updatedSelected[idjson].content) {
          updatedSelected[idjson].content = JSON.parse(jsonSpecEntry);
        }
      }

      return JSON.stringify(updatedSelected);
    });
  }, [jsonSpecEntry]);

  return (
    <>
      <Accordion
        defaultExpanded
        disabled={!advanceMode} // Disable based on advanceMode prop
        style={{
          margin: 6,
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderStyle: 'solid',
          borderColor: '#EEEEEE',
          boxShadow: 'none', // Remove elevation at the bottom
          borderWidth: 1,
          borderRadius: 6,
          opacity: advanceMode ? 1 : 1, // Reduce opacity when disabled
        }}
        onChange={handleAccordionChange}
      >
        <AccordionSummary
          disabled={!advanceMode} // Disable based on advanceMode prop
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            opacity: advanceMode ? 1 : 1, // Reduce opacity when disabled
            borderBottomStyle: 'solid',
            borderBottomWidth: 1,
            borderBottom: 'none', // Remove bottom border
          }}
          expandIcon={<ChevronDownIcon className="h-5 w-5 text-gray-500" />}
          id="panel-header"
          aria-controls="panel-content"
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                alignSelf: 'center',
                color: 'black',
                fontSize: 18,
                paddingLeft: 15,
              }}
            >
              {title}
            </div>

            <div>
              {advanceMode && (
                <>
                  <Button
                    style={{
                      borderRadius: 4,
                      backgroundColor: '#F50',
                      borderStyle: 'solid',
                      borderColor: '#F50',
                      fontSize: 18,
                      padding: 6,
                      color: 'white',
                      marginRight: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent propagation to accordion
                      setOpenModal(true);
                    }}
                  >
                    Select
                  </Button>
                  {removeButton}
                </>
              )}
            </div>
          </div>
        </AccordionSummary>
        <div
          style={{
            borderWidth: 1,
            borderStyle: 'solid',
            width: '80%',
            justifyContent: 'center', // Horizontal centering
            alignItems: 'center', // Vertical centering
            display: 'flex',
            borderColor: 'rgba(238, 238, 238, 1)',
            margin: '0 auto', // Center horizontally in its container
            marginBottom: 15,
          }}
        />
        <AccordionDetails style={{ width: '100%', display: 'false' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>Print type</div>
            <Button
              onClick={() => setOpenModalSectionSelection(true)}
              style={{
                height: 40,

                color: 'black',
                borderRadius: 5,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'black',
                padding: 12,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
                display: 'flex',
                marginLeft: 56, // add 56 pixels space between the div and the button
              }}
            >
              {keySpecification !== 'null'
                ? hashPrintTypes[keySpecification]
                : 'select a print type'}

              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {keySpecification !== 'null' ? (
            <div style={{ width: 'auto' }}>
              {testForRefresh
                && testForRefresh.fields.map((f, id) => (
                  <FieldPicker
                    // eslint-disable-next-line
                    key={id}
                    jsonSpec={jsonSpec}
                    setJsonSpec={setJsonSpecEntry}
                    jsonSpecEntry={jsonSpecEntry}
                    fieldInfo={f}
                    open={open}
                    lang={language}
                    doReset={doReset}
                  />
                ))}
            </div>
          ) : (
            <div />
          )}
        </AccordionDetails>
      </Accordion>
      <Modal
        open={openModal}
        onClose={() => handleOpenModal(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            width: '50%',
            height: '50%',
          }}
        >
          <div className="picker-container">
            <div className="searchContainer">
              <input
                className="searchInput"
                type="text"
                placeholder="Search"
                onInput={handleInputSearch}
              />
            </div>

            {localListResourcesForPdf ? (
              <ScriptureContentPicker
                onSelect={(e) => {
                  setTitle(e.localLabel);
                  setSelected((prev) => {
                    const pr = JSON.parse(prev);
                    pr[idjson].source = e.src.path;
                    return JSON.stringify(pr);
                  });
                  handleOpenModal(false);
                }}
                source={localListResourcesForPdf}
              />
            ) : (
              <div />
            )}
          </div>
        </div>
      </Modal>
      <ModalSectionSelection
        open={openModalSectionSelection}
        setOpen={setOpenModalSectionSelection}
        table={listChoiceSectionByWrapper}
        setSelected={(c) => {
          setSelected((prev) => {
            const t = { ...JSON.parse(prev) };
            t[idjson].type = c;
            t[idjson].content = {};
            return JSON.stringify(t);
          });
          setJsonSpecEntry('{}');
          setOpenModalSectionSelection(false);
        }}
      />
    </>
  );
}
