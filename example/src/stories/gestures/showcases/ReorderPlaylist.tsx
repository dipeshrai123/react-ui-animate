import { useState } from 'react';
import { Reorder } from 'react-ui-animate';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
}

const INITIAL_TRACKS: Track[] = [
  { id: 't1', title: 'Midnight City', artist: 'M83', duration: '4:03' },
  { id: 't2', title: 'Weightless', artist: 'Marconi Union', duration: '8:10' },
  { id: 't3', title: 'Strobe', artist: 'Deadmau5', duration: '10:37' },
  { id: 't4', title: 'Divenire', artist: 'Ludovico Einaudi', duration: '6:53' },
  { id: 't5', title: 'Intro', artist: 'The xx', duration: '2:07' },
];

const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    {[4, 8, 12].map((y) =>
      [5, 11].map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill="#9ca3af" />
      ))
    )}
  </svg>
);

const PlayIcon = ({ playing }: { playing: boolean }) =>
  playing ? (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
      <rect x="3" y="2" width="4" height="12" rx="1" />
      <rect x="9" y="2" width="4" height="12" rx="1" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
      <path d="M4 2.5v11l10-5.5-10-5.5z" />
    </svg>
  );

/**
 * A more "in the wild" showcase than a plain text list: each row carries
 * real interactive content (a play toggle) and metadata, and only the grip
 * icon can start a drag — clicking play/pause never gets mistaken for the
 * start of a reorder.
 */
const Example = () => {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>Playlist</h1>
      <p style={{ marginBottom: 30, color: '#666', maxWidth: 500 }}>
        Drag the grip icon to reorder tracks. Play/pause is a normal button —
        clicking it never starts a drag.
      </p>

      <Reorder.Group
        values={tracks}
        onReorder={setTracks}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 460,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {tracks.map((track) => {
          const playing = playingId === track.id;
          return (
            <Reorder.Item
              key={track.id}
              value={track}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                backgroundColor: playing ? '#f0f9ff' : '#fff',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Reorder.Handle style={{ display: 'flex', padding: 4 }}>
                <GripIcon />
              </Reorder.Handle>

              <button
                onClick={() => setPlayingId(playing ? null : track.id)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: playing ? '#3399ff' : '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <PlayIcon playing={playing} />
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1a1a1a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {track.title}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{track.artist}</div>
              </div>

              <span style={{ fontSize: 12, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                {track.duration}
              </span>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
};

export default Example;
