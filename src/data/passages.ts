// Original reading passages written for SkillSprint, with comprehension questions.

export interface ReadingQuestion {
  q: string;
  options: [string, string, string, string];
  answer: number; // index into options
  explain: string;
}

export interface Passage {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  paragraphs: string[];
  questions: ReadingQuestion[];
}

export const PASSAGES: Passage[] = [
  {
    id: 'garden', level: 'beginner', title: 'The Rooftop Garden',
    paragraphs: [
      'Maya lived on the top floor of a tall building in the middle of a busy city. From her window she could see roads, cars and grey rooftops, but almost no plants. One spring morning she decided to change that.',
      'She asked the building manager if she could use the flat roof. He agreed, as long as she kept it tidy and safe. Maya bought six large wooden boxes, a few bags of soil and some seeds. She planted tomatoes, beans, lettuce and a row of bright yellow sunflowers.',
      'At first, nothing seemed to happen. Maya watered the boxes every evening and checked them every morning. After ten days, tiny green shoots finally pushed up through the soil. Her neighbours began to notice. An old man from the third floor brought her a watering can. Two children from next door offered to pull out weeds.',
      'By the middle of summer, the roof was full of colour. Bees visited the sunflowers, and the tomatoes turned red. Maya shared the vegetables with everyone who had helped. The roof had become a place where neighbours met, talked and laughed together.',
    ],
    questions: [
      { q: 'Why did Maya decide to start a garden?', options: ['She could see almost no plants from her window', 'Her doctor told her to', 'She wanted to sell vegetables', 'The building manager asked her to'], answer: 0, explain: 'The passage says she could see roads, cars and rooftops, “but almost no plants”, and decided to change that.' },
      { q: 'What condition did the building manager set?', options: ['She had to pay rent for the roof', 'She had to keep the roof tidy and safe', 'She could only grow flowers', 'She had to finish by summer'], answer: 1, explain: 'He agreed “as long as she kept it tidy and safe”.' },
      { q: 'How long did it take for the first shoots to appear?', options: ['Two days', 'One month', 'Ten days', 'A whole season'], answer: 2, explain: '“After ten days, tiny green shoots finally pushed up through the soil.”' },
      { q: 'What did the garden become by the end of the story?', options: ['A small shop', 'A place where neighbours met', 'A playground for children', 'A home for birds'], answer: 1, explain: 'The last sentence says the roof became a place where neighbours met, talked and laughed together.' },
    ],
  },
  {
    id: 'lighthouse', level: 'beginner', title: 'The Last Lighthouse Keeper',
    paragraphs: [
      'For more than a hundred years, a lighthouse stood on the rocks at the edge of a small fishing village. Every night its light turned slowly, warning ships to stay away from the dangerous shore.',
      'Tomas was the last person to look after the lighthouse. Each evening he climbed the 120 steps to the top, cleaned the large glass lens and made sure the lamp was working. During storms he stayed awake all night, listening to the wind and watching the dark sea.',
      'One year, engineers arrived with a new automatic lamp. It could switch itself on and off and send a message if anything went wrong. Tomas was no longer needed. The village worried that he would be sad, but he surprised everyone.',
      'Tomas opened a small museum in the old keeper’s cottage. He showed visitors his logbooks, his tools and photographs of ships that had passed safely. Children loved hearing his stories about storms. The lighthouse no longer needed a keeper, but the village still needed someone to remember its history.',
    ],
    questions: [
      { q: 'What was the main purpose of the lighthouse?', options: ['To guide fishermen to the best fish', 'To warn ships away from the dangerous shore', 'To light the village streets', 'To signal the start of a storm'], answer: 1, explain: 'Its light turned slowly, “warning ships to stay away from the dangerous shore”.' },
      { q: 'How many steps did Tomas climb each evening?', options: ['100', '80', '120', '200'], answer: 2, explain: 'He “climbed the 120 steps to the top”.' },
      { q: 'Why was Tomas no longer needed?', options: ['The lighthouse was closed', 'He retired because of his age', 'An automatic lamp replaced his work', 'Ships stopped visiting the village'], answer: 2, explain: 'Engineers installed an automatic lamp that could switch itself on and off.' },
      { q: 'What did Tomas do after his job ended?', options: ['He moved to the city', 'He opened a museum', 'He became a fisherman', 'He built a new lighthouse'], answer: 1, explain: 'He opened a small museum in the old keeper’s cottage.' },
    ],
  },
  {
    id: 'sleep', level: 'intermediate', title: 'Why We Sleep',
    paragraphs: [
      'Sleep can look like a waste of time. For roughly a third of our lives we lie still, unaware of the world, unable to work, eat or protect ourselves. Yet almost every animal studied so far sleeps in some form, which suggests that sleep provides benefits important enough to outweigh these costs.',
      'One of the clearest benefits involves memory. During the day, the brain takes in a flood of new information. Researchers have found that during sleep the brain replays some of the day’s experiences, strengthening the connections that matter and weakening those that do not. People who sleep after learning a new skill often perform it better the next day than people who stay awake for the same amount of time.',
      'Sleep also appears to help the brain clean itself. Brain cells produce waste as they work, and studies in animals suggest that the fluid surrounding brain tissue flows more freely during deep sleep, carrying some of this waste away. Scientists are still investigating how important this process is in humans.',
      'Finally, sleep affects mood and decision-making. After a poor night, many people find it harder to concentrate, notice they are more irritable and tend to take more risks. A single bad night is rarely dangerous, but long-term lack of sleep has been linked to a range of health problems.',
      'For most adults, health organisations recommend seven or more hours a night. Regular bedtimes, a dark and quiet room and less screen use before bed are simple habits that can make a real difference.',
    ],
    questions: [
      { q: 'What does the fact that almost all animals sleep suggest, according to the passage?', options: ['Sleep is mostly wasted time', 'Sleep must provide important benefits', 'Animals sleep more than humans', 'Sleep evolved only recently'], answer: 1, explain: 'The passage argues that the near-universal nature of sleep suggests its benefits outweigh its costs.' },
      { q: 'How does sleep help memory?', options: ['It deletes all of the day’s information', 'It replays experiences and strengthens important connections', 'It prevents new learning', 'It only helps memory in children'], answer: 1, explain: 'The brain replays some experiences, strengthening connections that matter and weakening others.' },
      { q: 'What does the passage say about the brain “cleaning” itself?', options: ['It is fully proven in humans', 'It happens only while awake', 'Animal studies suggest waste is cleared during deep sleep, but research continues', 'It has been shown to be a myth'], answer: 2, explain: 'Animal studies suggest this, and “scientists are still investigating how important this process is in humans”.' },
      { q: 'How many hours of sleep do health organisations recommend for most adults?', options: ['Five or more', 'Six exactly', 'Seven or more', 'Ten or more'], answer: 2, explain: 'The final paragraph says “seven or more hours a night”.' },
    ],
  },
  {
    id: 'containers', level: 'intermediate', title: 'The Box That Changed the World',
    paragraphs: [
      'Before the 1950s, loading a cargo ship was slow, expensive work. Goods arrived at the docks in sacks, barrels and crates of every size. Teams of dock workers carried them aboard one piece at a time and packed them into the ship’s hold like a giant puzzle. A single ship could spend a week or more in port, and items were frequently damaged or stolen along the way.',
      'The shipping container offered a simple solution: put the goods into a standard steel box at the factory, and keep them in that box until they reach their destination. Because every container had the same shape and fittings, cranes could lift them straight from trucks or trains onto ships and stack them neatly. Work that once took days could be done in hours.',
      'The real breakthrough came when companies and governments agreed on standard sizes. A container loaded in one country could now travel by ship, rail and road across the world without ever being opened. Ports were redesigned around enormous cranes, and ships grew larger and larger to carry more boxes at once.',
      'The effects reached far beyond the docks. As the cost of moving goods fell, it became practical for companies to make products in one country, assemble them in another and sell them in a third. Critics point out that this also made it easier to move jobs to wherever labour was cheapest, and that the busy port towns of the past needed far fewer workers. Either way, much of what we buy today has spent part of its journey inside a plain metal box.',
    ],
    questions: [
      { q: 'What was the main problem with loading ships before containers?', options: ['There were too few ships', 'It was slow, costly and goods were often damaged or stolen', 'Ports did not have workers', 'Goods could only travel by rail'], answer: 1, explain: 'The first paragraph describes slow, expensive loading with frequent damage and theft.' },
      { q: 'Why could cranes handle containers so efficiently?', options: ['Containers were very light', 'Every container had the same shape and fittings', 'Containers were made of wood', 'Cranes were operated by computers'], answer: 1, explain: '“Because every container had the same shape and fittings, cranes could lift them…”' },
      { q: 'According to the passage, what was the “real breakthrough”?', options: ['Bigger cranes', 'Agreement on standard container sizes', 'Faster trucks', 'Cheaper steel'], answer: 1, explain: 'The third paragraph says the breakthrough came when companies and governments agreed on standard sizes.' },
      { q: 'Which criticism of containerisation does the passage mention?', options: ['Containers sink easily', 'It made it easier to move jobs to where labour was cheapest', 'It increased the cost of goods', 'It slowed down world trade'], answer: 1, explain: 'Critics say it made it easier to move jobs and that port towns needed fewer workers.' },
    ],
  },
  {
    id: 'placebo', level: 'advanced', title: 'The Puzzle of the Placebo',
    paragraphs: [
      'In medical research, a placebo is a treatment with no active ingredient — a sugar pill, a saline injection, or even a sham procedure. Placebos are used as a point of comparison: if a new drug is to be considered effective, patients who receive it should do measurably better than similar patients who unknowingly receive a placebo. Paradoxically, however, the people in the placebo group often report that they feel better too.',
      'Part of this improvement is not caused by the placebo at all. Many conditions, from colds to back pain, fluctuate naturally, and people tend to seek treatment when their symptoms are at their worst. Any subsequent improvement, which might have happened anyway, can easily be mistaken for the effect of the treatment — a statistical phenomenon known as regression to the mean. Careful trials therefore compare placebo groups with groups that receive no treatment whatsoever.',
      'When researchers do this, a genuine placebo response often remains, particularly for subjective symptoms such as pain, nausea and fatigue. Expectation appears to play a central role: believing that relief is coming can change how the brain processes signals from the body. Brain-imaging studies have recorded changes in pain-related activity after placebo treatment, and some placebo pain relief can be reduced by drugs that block the body’s natural painkilling chemicals.',
      'Context matters as well. Larger pills, injections rather than tablets, and warm, attentive clinicians have all been associated with stronger responses in some studies. Surprisingly, a number of small trials have reported benefits even when patients were told openly that they were receiving a placebo, although these findings still need confirmation in larger studies.',
      'None of this means that placebos can cure disease. They do not shrink tumours or repair broken bones, and relying on them instead of effective treatment can be dangerous. What the placebo effect does reveal is that the experience of illness is shaped not only by biology but also by belief, attention and the ritual of care.',
    ],
    questions: [
      { q: 'Why are placebos used in medical research?', options: ['They are cheaper than real drugs', 'As a comparison to judge whether a treatment really works', 'To cure patients who refuse medicine', 'To replace treatments that have side effects'], answer: 1, explain: 'A new drug is effective if patients do measurably better than a placebo group.' },
      { q: 'What does “regression to the mean” explain in this passage?', options: ['Why placebos always fail', 'Why improvement may happen naturally after people seek treatment at their worst', 'Why pills must be large', 'Why brain imaging is unreliable'], answer: 1, explain: 'People seek help when symptoms peak; later improvement might have happened anyway.' },
      { q: 'Which evidence suggests the placebo response is partly biological?', options: ['Patients prefer warm clinicians', 'Some placebo pain relief can be reduced by drugs that block natural painkillers', 'Colds get better on their own', 'Placebos shrink tumours'], answer: 1, explain: 'The third paragraph cites brain-imaging changes and blocking of the body’s painkilling chemicals.' },
      { q: 'What does the passage say about “open-label” placebos (patients told it is a placebo)?', options: ['They never work', 'Small trials report benefits, but larger studies are needed', 'They are now standard treatment', 'They work better than real drugs'], answer: 1, explain: 'A number of small trials reported benefits, “although these findings still need confirmation in larger studies”.' },
      { q: 'What is the author’s overall conclusion?', options: ['Placebos can replace medicine', 'Placebo research is a waste of time', 'Placebos cannot cure disease but show that belief and care shape the experience of illness', 'Only pain is real'], answer: 2, explain: 'The final paragraph states placebos cannot cure disease but reveal the role of belief, attention and care.' },
    ],
  },
  {
    id: 'cities', level: 'advanced', title: 'Cooling the Urban Heat Island',
    paragraphs: [
      'On a still summer evening, the centre of a large city can be several degrees warmer than the surrounding countryside. This difference, known as the urban heat island effect, arises because cities replace vegetation and moist soil with materials such as asphalt, concrete and brick. These surfaces absorb solar energy during the day and release it slowly after sunset, while tall buildings trap heat and reduce the wind that might otherwise carry it away.',
      'Waste heat adds to the problem. Vehicles, industrial processes and air-conditioning units all release energy into the surrounding air. In a frustrating feedback loop, the hotter a city becomes, the more residents rely on air conditioning, which pumps even more heat into the streets outside.',
      'The consequences are not merely uncomfortable. Prolonged heat raises the risk of heat-related illness, particularly among elderly people, young children and those who work outdoors. Higher temperatures can also worsen air quality and increase demand for electricity at the very moment when power networks are under greatest strain.',
      'Planners have developed a range of responses. Trees and parks cool the air through shade and through evaporation of water from leaves, and studies have measured noticeably lower surface temperatures beneath a mature canopy. “Cool roofs” coated with reflective materials bounce more sunlight back into the sky, and permeable pavements allow rainwater to soak in and later evaporate. Some cities have mapped their hottest neighbourhoods to target these measures where they are most needed — often in poorer areas that have historically received less investment in green space.',
      'No single measure solves the problem, and each comes with trade-offs: trees need water and years to mature, and reflective surfaces can create glare. Yet together, such changes can make cities measurably cooler and more resilient as heatwaves become more frequent.',
    ],
    questions: [
      { q: 'What is the urban heat island effect?', options: ['Cities being colder than the countryside', 'Cities being warmer than the surrounding countryside', 'Heat caused only by the sun', 'Islands being warmer than mainland cities'], answer: 1, explain: 'The first paragraph defines it as the city centre being warmer than the surrounding countryside.' },
      { q: 'What “feedback loop” does the passage describe?', options: ['Trees make cities hotter', 'More heat leads to more air conditioning, which releases more heat outside', 'Rain cools roofs, which causes more rain', 'Wind carries heat into the countryside'], answer: 1, explain: 'Hotter cities rely more on air conditioning, which pumps more heat into the streets.' },
      { q: 'How do trees help cool cities, according to the passage?', options: ['By blocking wind', 'Through shade and evaporation of water from leaves', 'By absorbing pollution', 'By reflecting sunlight like cool roofs'], answer: 1, explain: 'Trees cool “through shade and through evaporation of water from leaves”.' },
      { q: 'Why do some cities map their hottest neighbourhoods?', options: ['To raise property prices', 'To target cooling measures where they are most needed', 'To build more roads', 'To move residents elsewhere'], answer: 1, explain: 'Mapping helps target measures where needed, often in poorer areas with less green space.' },
      { q: 'Which trade-off is mentioned?', options: ['Cool roofs make buildings colder in summer', 'Trees need water and take years to mature', 'Parks increase air pollution', 'Permeable pavements cause flooding'], answer: 1, explain: 'The last paragraph says trees need water and years to mature, and reflective surfaces can cause glare.' },
    ],
  },
];

export function wordCount(p: Passage): number {
  return p.paragraphs.join(' ').trim().split(/\s+/).length;
}
