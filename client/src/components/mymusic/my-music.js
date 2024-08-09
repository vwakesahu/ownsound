import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Contract, ethers } from "ethers";
import { ownSoundContractABI, ownSoundContractAddress } from "@/utils/contract";
import { Music, Loader2, PlayCircle, Pause } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setMusicPlayer } from "@/redux/musicPlayerSlice";
import { Button } from "@/components/ui/button";

const MyMusic = () => {
  const [purchasedSongs, setPurchasedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const w0 = wallets[0];
  const dispatch = useDispatch();

  const getPurchasedSongs = async () => {
    try {
      const provider = await w0?.getEthersProvider();
      if (!provider) throw new Error("Provider is not available");

      const signer = await provider.getSigner();
      if (!signer) throw new Error("Signer is not available");

      const contract = new Contract(
        ownSoundContractAddress,
        ownSoundContractABI,
        signer
      );

      const purchasedNFTs = await contract.getWalletPurchasedNFTs(w0.address);
      const songsPromises = purchasedNFTs.map((song) =>
        contract.nftMetadata(song)
      );
      const songs = await Promise.all(songsPromises);

      const formattedSongs = songs.map((song, index) => ({
        id: purchasedNFTs[index].toString(),
        tokenId: song[2],
        title: song[3],
        description: song[4],
        image: song[5],
        price: song[0],
        rentPrice: song[8],
        rentDuration: song[9],
        owner: song[10],
        cid: song[12].toString(),
      }));

      setPurchasedSongs(formattedSongs);
    } catch (error) {
      console.error("Error fetching purchased songs:", error);
      toast.error("Failed to fetch purchased songs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ready && authenticated && w0?.address) {
      getPurchasedSongs();
    }
  }, [ready, authenticated, w0?.address]);

  const handlePlay = (song) => {
    const number = Number(song.cid);
    console.log(number)
    dispatch(
      setMusicPlayer({
        uri: `/api/hashsong/${number}`,
        isPlaying: true,
        index: 0,
        coverImage: song.image,
        title: song.title,
        artist: song.description,
      })
    );
    setCurrentlyPlaying(currentlyPlaying === song.id ? null : song.id);
  };

  if (!ready || !authenticated || !w0?.address) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Purchased Songs</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
        </div>
      ) : purchasedSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedSongs.map((song) => (
            <motion.div
              key={song.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="relative pb-2/3">
                <img
                  src={song.image}
                  alt={song.title}
                  className="absolute h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{song.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{song.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ID: {song.id}</span>
                  <Button
                    onClick={() => handlePlay(song)}
                    size="sm"
                    variant={currentlyPlaying === song.id ? "default" : "outline"}
                    className="min-w-[40px]"
                  >
                    {currentlyPlaying === song.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <Music className="mx-auto text-gray-400 w-16 h-16 mb-4" />
          <p className="text-xl">You haven't purchased any songs yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyMusic;