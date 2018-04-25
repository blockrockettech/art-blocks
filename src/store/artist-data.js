const artists = [
  {
    artistCode: 'BJD',
    name: 'Barrie J Davis',
    twitter: '@barriejdavies',
    strapline: 'Hello, I\'m Barrie J Davies and I\'m an artist. My artwork is a fun colourful psychedelic and humourous approach to expose the human condition.',
    bio: 'Hello, I\'m Barrie J Davies and I\'m an artist (born 1977) I\'m a British artist from Milford Haven, Pembrokeshire, Wales. I graduated from the Southampton Institute with a Fine Art degree in 2000 and I completed my Master\'s Degree at the University of Wales Institute, Cardiff in 2004. I now live and work in Brighton, England UK. My artwork is a fun colourful psychedelic and humourous approach to expose the human condition: notions of success, money, glamour, love, death, sex, gender & religion are picked at with dry comedic use of tragedy meshed with absurdity.',
    img: 'static/artists/BarrieD_@x2.png'
  },
  {
    artistCode: 'JOC',
    name: 'James O\'Connell',
    twitter: '@Jamesp0p',
    strapline: 'James O\'Connell is a Manchester based creative and illustrator. Simplicity is the key to his work allowing the expression of the idea to reign supreme.',
    bio: 'James O\'Connell is a Manchester based creative who has a passion for mixing colour and lines. He applies his minimalistic style to a variety of themes and has created work for the likes of Wired Magazine, Youtube, T3 Magazine, BBC and The Atlantic to name a few. He is hugely inspired by contemporary pop culture in all its forms - from motion pictures, music to advertising and sport. Simplicity is the key to his work allowing the expression of the idea to reign supreme.',
    img: 'static/artists/JamesOc_@x2.png',
    live: true
  },
  {
    artistCode: 'PDA',
    name: 'Peter Davis',
    twitter: '@peterdavis_art',
    strapline: 'I am a Prize-winning professional portrait painter and member of MAFA. My aim, as a social realist painter, is to capture the spirit of the age and create contemporary portraiture.',
    bio: 'I am a prize-winning professional portrait painter and elected member of the Manchester Academy of Fine Arts (MAFA). My aim, as a social realist painter, is to capture the spirit of the age and create contemporary portraiture that tells stories about my sitters through a strong visual narrative.',
    img: 'static/artists/PeterD_@x2.png',
    live: true
  },
  {
    artistCode: 'STA',
    name: 'Sam Taylor',
    twitter: '@SptSam',
    strapline: 'Sam Taylor is an independent graphic designer and illustrator known for his bold, unbridled and explosive artworks. Outrageous colour schemes and intricate line-work.',
    bio: 'Sam Taylor is known for his bold, unbridled and explosive artworks. Outrageous colour schemes and intricate line-work are partnered up with characters and motifs to create his fun, mad world.Originally from Leicester, he\'s worked with a wealth of impressive clients since moving to London many moons ago – including Google, The New Yorker, Vans and Nickelodeon.',
    img: 'static/artists/SamT_@x2.png'
  },
  {
    artistCode: 'LHK',
    name: 'Laura Hawkins AKA Paper Hawk',
    twitter: '@paper_hawk',
    bio: 'Laura Hawkins is a designer and illustrator based in Manchester. Her illustration alias ‘Paper Hawk’ was born of her desire to create illustrations full of character, charm and life - that weren\'t \'perfect\', but who\'s imperfections were what made them interesting.Working in graphic design since graduating from Falmouth College of Arts back in 2005 Laura had been increasingly drawn to illustration. After a recent move from London to Manchester, she began experimenting with using paper as the \'paint\', and discovered a passion she never knew existed.Her aim with Paper Hawk is to make engaging, interesting and unique illustrations that bring a brief to life. Using papers salvaged from magazines, newspapers, recycling bins, empty paper packaging, and donations from friends and colleagues her work aims to giving new life to something that would otherwise be discarded. She also creates some of the papers herself by painting with watercolours or inks and then tearing these up too.',
    strapline: 'Laura Hawkins is a Illustrator & paper collage artist inspired by nature.',
    img: 'static/artists/LauraH_@x2.png',
    live: true
  },
  {
    artistCode: 'CNJ',
    name: 'CoinJournal',
    twitter: '@CoinJournal',
    bio: 'CoinJournal is a Manchester-based Bitcoin and cryptocurrency news site. The artwork submitted has been produced as a collaboration with several different designers, incorporating the style of 1930s cartoons and celebrating the disruptive nature of cryptocurrencies.',
    strapline: 'CoinJournal is a Manchester based artist who collaborates with several different designers, incorporating the style of 1930s cartoons',
    img: 'static/artists/coinjournal_x2.png',
    live: true
  },
  {
    artistCode: 'JBO',
    name: 'Jane Bowyer',
    twitter: '@bowyerjane',
    strapline: 'Jane Bowyer is an independent graphic designer and illustrator based in Manchester.',
    bio: 'Jane Bowyer is an independent graphic designer and illustrator based in Manchester.',
    img: 'static/artists/JaneB_@x2.png'
  },
  {
    artistCode: 'CHE',
    name: 'Chris English',
    twitter: '@afullenglish',
    bio: '',
    img: 'static/artists/ChrisE_@x2.png'
  },
  {
    artistCode: 'KOR',
    name: 'Katie O\'Rourke',
    twitter: '@katieor_design',
    bio: 'Katie is a graphic designer, illustrator and artist currently based in Manchester. Her love for travel influences her work, often exploring places she has visited through both hand drawn and digital media. She’s interested in the dichotomy between these two approaches and the different sense of connection to place that comes through in each.',
    strapline: 'Katie is a graphic designer, illustrator and artist currently based in Manchester. Her love for travel influences her work, often exploring places she has visited.',
    img: 'static/artists/KatieORouke_@x2.png',
    live: true
  },
  {
    artistCode: 'DVA',
    name: 'David Arnott',
    twitter: '@DavidPArnott7',
    bio: 'David Arnott is a Mosaic Artist based in Salford Manchester. He take popular and cultural icons and creates an image from hand cut pieces of ceramic tile',
    strapline: 'David Arnott is a Mosaic Artist based in Salford Manchester. He take popular and cultural icon',
    img: 'static/artists/david-arnott_x2.png'
  },
  {
    artistCode: '89A',
    name: '89—A',
    twitter: '@Mathew_Lucas',
    bio: 'Mathew is a multidisciplinary designer, one third of Studio Treble and behind the looping gif animations of 89A. Starting his career in games after studying graphic design, a diverse output is something he’s always strived for. From animation & illustration to branding & digital work.With 89A Mathew was originally looking to learn animation and 3D software, this quickly went from a side project to part of his daily routine. Working originally with the restrictive gif format, the constraints made a great playground for exploration and experimentation. Now he’s looking take what he has learnt with 89A and work on a more interactive experiences.',
    strapline: 'Mathew is a multidisciplinary designer, one third of Studio Treble and behind the looping gif animations of 89A.',
    img: 'static/artists/89AProfile@x2.png',
    live: true
  },
  {
    artistCode: 'HSM',
    name: 'Hamish Muir',
    twitter: '@CoinJournal',
    bio: 'Hamish Muir was co-founder of the London-based graphic design studio 8vo (1985–2001), and co-editor of Octavo, International Journal of Typography (1986–92). Since 2001, he has held a fractional position as Senior Lecturer on the BA (Hons) Graphic and Media Design programme at the London College of Communication.',
    strapline: 'Hamish London-based graphic designer and Senior Lecturer on the BA (Hons) Graphic and Media Design programme at the London College of Communication.',
    img: 'static/artists/HamishMuirProfile@x2.png'
  },
  {
    artistCode: 'SCH',
    name: 'Stanley Chow',
    twitter: '@stan_chow',
    bio: 'Mancunian illustrator... I illustrate the faces of the New Yorker and sometimes other people',
    strapline: 'Mancunian illustrator... I illustrate the faces of the New Yorker and sometimes other people',
    img: 'static/artists/StanleyChowProfile@x2.png'
  },
  {
    artistCode: 'MRL',
    name: 'Muirmcneil',
    img: 'static/artists/MuirMcProfile@x2.png'
  },
  {
    artistCode: 'BYE',
    name: 'Bryan Edmondson',
    img: 'static/artists/BrynEdProfile@x2.png'
  },
  {
    artistCode: 'LAM',
    name: 'laurence-amelie',
    img: 'static/artists/LAProfile@x2.png'
  }
];
module.exports = artists;
