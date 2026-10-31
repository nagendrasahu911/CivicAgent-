/**
 * Backward compatibility alias for GoogleMap
 * All map instances in CivicSaathi AI now use Google Maps JavaScript API.
 */
import React from 'react';
import { GoogleMap, GoogleMapProps } from './GoogleMap';

export const LeafletMap: React.FC<any> = (props) => {
  const { onSelectCoords, selectedCoord, ...rest } = props;

  return (
    <GoogleMap
      {...rest}
      mode={onSelectCoords ? 'picker' : 'display'}
      selectedCoord={selectedCoord}
      onLocationChange={
        onSelectCoords
          ? (info) => {
              onSelectCoords(info.lat, info.lon);
            }
          : undefined
      }
    />
  );
};

export default LeafletMap;
