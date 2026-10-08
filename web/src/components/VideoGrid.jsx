import React, { useState } from 'react';
import { VideoTile } from './VideoTile';

export function VideoGrid({
  localStream,
  currentUser,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isStreamingGame,
  remotePeers,
  resolutionTier,
}) {
  const [pinnedId, setPinnedId] = useState(null);

  const remotePeerList = Object.values(remotePeers);
  const totalCount = 1 + remotePeerList.length;

  // Toggle pinning/spotlight
  const handleTogglePin = (id) => {
    setPinnedId((prev) => (prev === id ? null : id));
  };

  // If a participant is pinned, render Spotlight Layout
  if (pinnedId) {
    const isMePinned = pinnedId === 'local';
    const pinnedRemote = remotePeerList.find((p) => p.socketId === pinnedId);

    return (
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden h-full">
        {/* Main Stage (Spotlighted video) */}
        <div className="flex-1 h-full min-h-[300px]">
          {isMePinned ? (
            <VideoTile
              stream={localStream}
              user={currentUser}
              isMe={true}
              isAudioMuted={isAudioMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              isStreamingGame={isStreamingGame}
              isPinned={true}
              onTogglePin={() => handleTogglePin('local')}
              qualityLabel={resolutionTier.toUpperCase()}
            />
          ) : pinnedRemote ? (
            <VideoTile
              stream={pinnedRemote.stream}
              user={pinnedRemote.user}
              isMe={false}
              isAudioMuted={pinnedRemote.isAudioMuted}
              isVideoOff={pinnedRemote.isVideoOff}
              isScreenSharing={pinnedRemote.isScreenSharing}
              isStreamingGame={pinnedRemote.isStreamingGame}
              isPinned={true}
              onTogglePin={() => handleTogglePin(pinnedRemote.socketId)}
              qualityLabel="720p HD"
            />
          ) : null}
        </div>

        {/* Thumbnail Strip (Remaining participants) */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-72 lg:max-h-full shrink-0">
          {/* Local user if not pinned */}
          {!isMePinned && (
            <div className="w-56 lg:w-full h-36 shrink-0">
              <VideoTile
                stream={localStream}
                user={currentUser}
                isMe={true}
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                isScreenSharing={isScreenSharing}
                isStreamingGame={isStreamingGame}
                isPinned={false}
                onTogglePin={() => handleTogglePin('local')}
                qualityLabel={resolutionTier.toUpperCase()}
              />
            </div>
          )}

          {/* Remote peers if not pinned */}
          {remotePeerList
            .filter((p) => p.socketId !== pinnedId)
            .map((peer) => (
              <div key={peer.socketId} className="w-56 lg:w-full h-36 shrink-0">
                <VideoTile
                  stream={peer.stream}
                  user={peer.user}
                  isMe={false}
                  isAudioMuted={peer.isAudioMuted}
                  isVideoOff={peer.isVideoOff}
                  isScreenSharing={peer.isScreenSharing}
                  isStreamingGame={peer.isStreamingGame}
                  isPinned={false}
                  onTogglePin={() => handleTogglePin(peer.socketId)}
                  qualityLabel="720p HD"
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Dynamic Responsive Grid Layouts
  let gridLayoutClass = '';
  if (totalCount === 1) {
    gridLayoutClass = 'grid-cols-1 max-w-4xl mx-auto';
  } else if (totalCount === 2) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto';
  } else if (totalCount <= 4) {
    gridLayoutClass = 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto';
  } else if (totalCount <= 6) {
    gridLayoutClass = 'grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto';
  } else {
    gridLayoutClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  }

  return (
    <div className="flex-1 p-3 overflow-y-auto flex items-center justify-center">
      <div className={`grid gap-3.5 w-full h-full auto-rows-fr ${gridLayoutClass}`}>
        {/* Local Participant Tile */}
        <VideoTile
          stream={localStream}
          user={currentUser}
          isMe={true}
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isStreamingGame={isStreamingGame}
          isPinned={false}
          onTogglePin={() => handleTogglePin('local')}
          qualityLabel={resolutionTier.toUpperCase()}
        />

        {/* Remote Peers Tiles */}
        {remotePeerList.map((peer) => (
          <VideoTile
            key={peer.socketId}
            stream={peer.stream}
            user={peer.user}
            isMe={false}
            isAudioMuted={peer.isAudioMuted}
            isVideoOff={peer.isVideoOff}
            isScreenSharing={peer.isScreenSharing}
            isStreamingGame={peer.isStreamingGame}
            isPinned={false}
            onTogglePin={() => handleTogglePin(peer.socketId)}
            qualityLabel="720p HD"
          />
        ))}
      </div>
    </div>
  );
}
