import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import NotebookHeader from '@/components/notebook/NotebookHeader';
import SourcesSidebar from '@/components/notebook/SourcesSidebar';
import ChatArea from '@/components/notebook/ChatArea';
import StudioSidebar from '@/components/notebook/StudioSidebar';
import MobileNotebookTabs from '@/components/notebook/MobileNotebookTabs';
import { Citation } from '@/types/message';

const Notebook = () => {
  const { id: notebookId } = useParams();
  const { notebooks, isLoading: notebooksLoading } = useNotebooks();
  const { sources, isLoading: sourcesLoading } = useSources(notebookId);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const isDesktop = useIsDesktop();

  // Find the notebook or set it to null if not found
  const notebook = notebooks?.find(n => n.id === notebookId) || null;
  
  // Check if we're still loading data
  const isLoading = notebooksLoading || sourcesLoading;
  
  // Check if notebook exists but is still loading
  const isNotebookLoading = !notebook && isLoading && notebooksLoading;

  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  // Show loading state while data is being fetched
  if (isNotebookLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notebook...</p>
        </div>
      </div>
    );
  }

  // Show error if notebook doesn't exist
  if (!notebook && !isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notebook Not Found</h2>
          <p className="text-gray-600 mb-4">The notebook you're looking for doesn't exist or has been deleted.</p>
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Dynamic width calculations for desktop - expand studio when editing notes
  const sourcesWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[25%]';
  const studioWidth = 'w-[30%]'; // Expanded width for note editing
  const chatWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[45%]';

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <NotebookHeader 
        title={notebook?.title || 'Untitled Notebook'} 
        notebookId={notebookId} 
      />
      
      {isDesktop ? (
        // Desktop layout (3-column)
        <div className="flex-1 flex overflow-hidden">
          <div className={`${sourcesWidth} flex-shrink-0`}>
            <SourcesSidebar 
              hasSource={hasSource || false} 
              notebookId={notebookId}
              selectedCitation={selectedCitation}
              onCitationClose={handleCitationClose}
              setSelectedCitation={setSelectedCitation}
            />
          </div>
          
          <div className={`${chatWidth} flex-shrink-0`}>
            <ChatArea 
              hasSource={hasSource || false} 
              notebookId={notebookId}
              notebook={notebook}
              onCitationClick={handleCitationClick}
            />
          </div>
          
          <div className={`${studioWidth} flex-shrink-0`}>
            <StudioSidebar 
              notebookId={notebookId} 
              onCitationClick={handleCitationClick}
            />
          </div>
        </div>
      ) : (
        // Mobile/Tablet layout (tabs)
        <MobileNotebookTabs
          hasSource={hasSource || false}
          notebookId={notebookId}
          notebook={notebook}
          selectedCitation={selectedCitation}
          onCitationClose={handleCitationClose}
          setSelectedCitation={setSelectedCitation}
          onCitationClick={handleCitationClick}
        />
      )}
    </div>
  );
};

export default Notebook;