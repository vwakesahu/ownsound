import { PencilIcon } from "lucide-react";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { audioTracks, playlists } from "@/utils/dummy";
import HorizontalScroll from "../horizontal-scroll";
import { v4 as uuidv4 } from "uuid";
import PublishAudio from "../uploadMusic/publish-audio";

const Profile = () => {
  const renderTrackItem = (track) => (
    <>
      <div className="w-36 h-36">
        <img
          src={track.cover}
          className="aspect-square rounded-md w-full h-full object-cover"
          alt={track.title}
        />
      </div>
      <div>
        <p
          className="w-full text-center truncate max-w-xs mx-auto"
          title={track.title}
        >
          {track.title}
        </p>
        <p className="text-sm text-center text-muted-foreground">
          {track.artist}
        </p>
      </div>
    </>
  );

  const renderPlaylistItem = (playlist) => (
    <>
      <div className="w-36 h-36">
        <img
          src={playlist.image}
          className="aspect-square rounded-md w-full h-full object-cover"
          alt={playlist.name}
        />
      </div>
      <div>
        <p
          className="w-full text-center truncate max-w-xs mx-auto"
          title={playlist.name}
        >
          {playlist.name}
        </p>
        <p className="text-sm text-center text-muted-foreground">
          {playlist.creator}
        </p>
      </div>
    </>
  );
  return (
    <div className="w-full flex flex-col gap-6 pb-32 h-[85vh] overflow-y-auto scrollbar-hide">
      <div className="mt-10 scroll-m-20 border-b pb-4 text-3xl font-semibold tracking-tight transition-colors first:mt-0 w-full flex items-center justify-between">
        GM Ser!
        <PublishAudio />
      </div>

      <div className="flex w-full gap-3 items-center">
        <div className="w-24 h-24 relative">
          <img src="/nft.avif" className="rounded-lg" />
          <div className="w-6 h-6 flex items-center justify-center absolute bg-muted z-50 -bottom-2 -right-2 rounded-full cursor-pointer drop-shadow">
            <PencilIcon className="w-3" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label>Username</Label>
          <Input placeholder="Change username" className="max-w-xs" />
        </div>
      </div>
      <div className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
        Your NFS's
      </div>
      <HorizontalScroll
        items={audioTracks}
        renderItem={renderTrackItem}
        containerId={`scrollContainer-${uuidv4()}`}
      />
      <div className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
        Your Playlist
      </div>
      <HorizontalScroll
        items={playlists}
        renderItem={renderPlaylistItem}
        containerId={`scrollContainer-${uuidv4()}`}
      />
    </div>
  );
};

export default Profile;
