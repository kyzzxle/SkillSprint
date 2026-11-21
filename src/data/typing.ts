// Word lists and code snippets for the typing tests (original compilations of common English words).

export const WORDS_BEGINNER = `the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is was are had has did said each tell set put end does run own big old far few man men may sun sea red top try ask let job cut lot sit yes box cat dog bed car eat fun hot add age art bag bus cup ear eye fly key law leg map pay pen row sky toy war win`.split(/\s+/);

export const WORDS_INTERMEDIATE = `about above across action active actual adult advice afford afraid again agency agree ahead allow almost alone along already always amount animal answer anyone appear apply area argue around arrive article artist assume attack attempt author avoid basic battle beauty become before begin behind believe benefit better between beyond bottle bright brother budget build business button camera campaign cancer capital career carry catch cause center chance change charge check choice choose church citizen claim class clear close coach color common company compare concern consider contain continue control country couple course create crime culture current customer danger debate decade decide defense degree design detail develop differ dinner direct doctor dream drive during early easy economy edge effect effort eight either election energy enjoy enough enter entire event every evidence exactly example expect expert explain factor family father feeling field figure final finger finish follow foreign forget former forward friend future garden general glass ground group growth guess happen health heart heavy history hotel house however human hundred idea image impact include increase indeed inside instead interest island issue itself kitchen language large later laugh leader learn least leave letter level light listen little local machine major manage market master matter measure media member memory mention method middle million minute mission model modern moment money morning mother movement music nation nature nearly network never night normal number object office often order others owner paper parent partner party patient pattern peace period person phone picture piece place plant player point police policy popular position power prepare present pretty price private problem process produce program project property protect prove public purpose quality question quickly rather reach ready reason receive record reduce region relate remain remember report resource respond result return reveal right river season second section security senior series serious service several shake share short shoulder simple simply single sister skill small social society soldier source south space speak special spend sport spring staff stage standard start state station still story strategy street strong student study style subject success suggest summer support surface system table teacher team theory thought thousand three through today together tonight total toward travel treat trouble truth under until usually value various very victim view visit voice wait walk wall watch water weapon weather week weight while white whole window within without woman wonder worker world worry write wrong young`.split(/\s+/);

export const WORDS_ADVANCED = `abundance accelerate accommodate accumulate acknowledge acquisition adjacent administer advocate aesthetic allocation ambiguous analogous anticipate apparatus appreciable approximate arbitrary articulate ascertain assimilate asymmetric attribute authentic autonomous benevolent bureaucracy calibrate catastrophe circumstance coherent collaborate commemorate compatible comprehensive conscientious consequence considerable contemporary contingency controversy convergence correspond credibility criterion curriculum deliberate demonstrate deteriorate diligent dimension discrepancy disseminate distinguish elaborate eloquent emphasize empirical encompass endeavor enthusiastic equilibrium equivalent essentially evaluate exacerbate exaggerate exemplify explicit facilitate feasible fluctuate formulate fundamental generation hierarchy hypothesis illuminate implement implicit inadvertent incentive inevitable infrastructure inherent initiative innovation integrity intermediate interpretation intricate jurisdiction juxtapose legitimate magnitude maintenance manifest mechanism meticulous miscellaneous momentum negotiate nevertheless notwithstanding objective obsolete occurrence optimistic orchestrate paradigm parallel paramount perception perpetual perspective phenomenon plausible precedent predominant preliminary prerequisite prevalent proficient proliferate prominent proportion prospective quantitative questionnaire rationale reciprocal recommend redundant reinforce relevance reluctant remarkable rendezvous replicate resilience retrospect rhetoric rigorous scrutinize simultaneous sophisticated spontaneous strategic subsequent substantial sufficient supplementary synthesis technique temperament tentative thoroughly threshold transcend transparent turbulent ubiquitous unprecedented utilize versatile vulnerable whimsical zealous`.split(/\s+/);

export interface CodeSnippet {
  lang: string;
  code: string;
}

// Original snippets. Indentation uses spaces; leading indentation is filled in automatically while typing.
export const CODE_SNIPPETS: CodeSnippet[] = [
  { lang: 'JavaScript', code: `function sum(values) {
  let total = 0;
  for (const v of values) {
    total += v;
  }
  return total;
}` },
  { lang: 'Python', code: `def is_palindrome(text):
    clean = [c.lower() for c in text if c.isalnum()]
    return clean == clean[::-1]` },
  { lang: 'TypeScript', code: `interface User {
  id: number;
  name: string;
  email?: string;
}

const users: User[] = [];` },
  { lang: 'JavaScript', code: `const debounce = (fn, wait = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};` },
  { lang: 'Python', code: `scores = {"ana": 92, "ben": 78, "cy": 85}
best = max(scores, key=scores.get)
print(f"Top scorer: {best} ({scores[best]})")` },
  { lang: 'CSS', code: `.card {
  display: grid;
  gap: 1rem;
  padding: 16px 24px;
  border-radius: 12px;
}` },
  { lang: 'SQL', code: `SELECT name, COUNT(*) AS orders
FROM customers
JOIN orders ON orders.customer_id = customers.id
GROUP BY name
ORDER BY orders DESC;` },
  { lang: 'Go', code: `func fib(n int) int {
	if n < 2 {
		return n
	}
	return fib(n-1) + fib(n-2)
}`.replace(/\t/g, '    ') },
  { lang: 'JavaScript', code: `const res = await fetch("/api/items?page=2");
if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
const { items = [] } = await res.json();` },
  { lang: 'Rust', code: `fn main() {
    let words = vec!["alpha", "beta", "gamma"];
    for (i, w) in words.iter().enumerate() {
        println!("{}: {}", i, w);
    }
}` },
  { lang: 'Python', code: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()` },
  { lang: 'HTML', code: `<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input id="email" type="email" required>
  <button type="submit">Join</button>
</form>` },
];
