import React from "react";
import JWPlayer from "@jwplayer/jwplayer-react";

export const TrafficCameraPlayer = ({ feedUrl }: { feedUrl: string }) => {

  const playlist = [
    {
      title: "traffic camera",
      sources: [
        {
          file: feedUrl,
          type: "application/vnd.apple.mpegurl",
          height: 180,
          width: 320,
          label: "180p",
          bitrate: 396558,
          filesize: 4709132,
          framerate: 30,
        },
      ]
    },
  ];


  return (
    <JWPlayer
      key={feedUrl}
      library="https://content.jwplatform.com/libraries/7fGXQztf.js"
      // library="https://cdn.jwplayer.com/libraries/1pOrUWNs.js"
      playlist={playlist}
      config={{
        pipIcon: "enabled",
        playbackRateControls: true,
        displaydescription: true,
        displaytitle: true,
        autostart: true,
      }}
    // didMountCallback={({ player }) => {
    //   player.on("all", (e) => {
    //     console.log(e);
    //   });
    // }}
    />
  );
}
