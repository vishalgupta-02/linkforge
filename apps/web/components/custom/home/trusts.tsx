"use client";

import React from "react";
import { AvatarCircles } from "@/components/ui/avatar-circles";

const Trusts = () => {
  return (
    <section className="py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-6 md:flex-row md:justify-between">
        <p className="text-md text-center font-semibold text-zinc-500 md:text-left">
          Trusted by 1M+ creators worldwide
        </p>
        <AvatarCircles
          numPeople={9928}
          avatarUrls={[
            {
              imageUrl: "https://avatars.githubusercontent.com/u/101015515",
              profileUrl: "https://github.com/vishalgupta-02",
            },
            {
              imageUrl:
                "https://t3.ftcdn.net/jpg/08/13/42/16/240_F_813421678_W90OZ5WHwmNVpBvVUiUw2g2v1yotPAam.jpg",
              profileUrl: "https://github.com/vishalgupta-02",
            },
            {
              imageUrl:
                "https://t3.ftcdn.net/jpg/13/32/13/30/240_F_1332133038_GBN1IwSytldHdCkAoBF3ZoJVyP8fWhKH.jpg",
              profileUrl: "https://github.com/vishalgupta-02",
            },
            {
              imageUrl:
                "https://t3.ftcdn.net/jpg/08/09/86/52/240_F_809865234_TxUjKHQzhq4ymhlpNFsI427nNp2y8t8w.jpg",
              profileUrl: "https://github.com/vishalgupta-02",
            },
          ]}
        />
      </div>
    </section>
  );
};

export default Trusts;
