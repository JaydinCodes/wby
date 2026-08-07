export interface TeamRevealData {
  id: string;
  number: string;
  name: string;
  logo: string;
  video: string;
  verse: string;
  verseReference: string;
}

export const chosenReveal: TeamRevealData = {
  id: "chosen",
  number: "01",
  name: "The Chosen",
  logo: "/images/chosen.png",
  video: "/media/chosen.mp4",
  verse: "My sheep hear my voice, and I know them, and they follow me.",
  verseReference: "John 10:27",
};

export const eaglesReveal: TeamRevealData = {
  id: "eagles-wings",
  number: "02",
  name: "Eagles Wings",
  logo: "/images/eagles.png",
  video: "/media/eagle.mp4",
  verse: "They shall mount up with wings as eagles.",
  verseReference: "Isaiah 40:31",
};

export const pathfindersReveal: TeamRevealData = {
  id: "pathfinders",
  number: "03",
  name: "PathFinders",
  logo: "/images/pathfinders.png",
  video: "/media/pathfinders.mp4",
  verse: "In all thy ways acknowledge him, and he shall direct thy paths.",
  verseReference: "Proverbs 3:6",
};

export const warriorsReveal: TeamRevealData = {
  id: "striped-warriors",
  number: "04",
  name: "Striped Warriors",
  logo: "/images/striped.png",
  video: "/media/warriors.mp4",
  verse: "Be strong and of a good courage.",
  verseReference: "Joshua 1:9",
};
