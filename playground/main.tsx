import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BarChart3, FileCheck2, Landmark, ShieldCheck } from "lucide-react";

import "./styles.css";
import {
  Accordion,
  AccordionItem,
  Alert,
  Badge,
  Band,
  BarChart,
  BrandProvider,
  BrandSettingsPanel,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Chip,
  DonutChart,
  Field,
  FileUpload,
  Gauge,
  Grid,
  Hero,
  Input,
  LineChart,
  Logo,
  Modal,
  Navbar,
  PageFooter,
  Pagination,
  ProgressBar,
  RadarChart,
  RagIndicator,
  riskStatusTones,
  SectionHeader,
  SegmentedControl,
  Select,
  Sparkline,
  Stack,
  StatCard,
  StatusBadge,
  Steps,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  Teaser,
  Textarea,
  Toaster,
  Tooltip,
  useToast,
} from "../src";

// Sample values for the gallery only.
const radarAxes = [
  { key: "fin", label: "Financial strength" },
  { key: "ind", label: "Industry strength" },
  { key: "env", label: "Environmental stability" },
  { key: "cmp", label: "Competitive advantage" },
  { key: "gov", label: "Governance" },
  { key: "col", label: "Collateral cover" },
];

function Gallery() {
  const [page, setPage] = useState(3);
  const [density, setDensity] = useState("regular");
  const [modalOpen, setModalOpen] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const { toast } = useToast();

  return (
    <div data-cg-density={density}>
      <Navbar
        links={[
          { label: "Components", href: "#components", active: true },
          { label: "Charts", href: "#charts" },
          { label: "Brand", href: "#brand" },
        ]}
        actions={<Button size="small" href="#brand">Change brand</Button>}
        sticky
      />

      <Hero
        theme="dark"
        background="grid"
        eyebrow="Credigit design system"
        title={<>Reusable components, <em>one brand</em></>}
        description="Every component reads the brand tokens. Change the colours or logo in the panel below and the whole page follows."
        actions={
          <>
            <Button href="#brand">Try brand settings</Button>
            <Button variant="tertiary" href="#components">Browse components</Button>
          </>
        }
        media={
          <RadarChart
            axes={radarAxes}
            series={[
              { name: "Obligor", values: { fin: 72, ind: 64, env: 58, cmp: 80, gov: 70, col: 66 }, tone: "accent" },
              { name: "Sector median", values: { fin: 60, ind: 70, env: 62, cmp: 55, gov: 65, col: 60 }, tone: "neutral" },
            ]}
            showLegend
          />
        }
      />

      <Band id="components" spacing="large">
        <Stack gap="large">
          <SectionHeader eyebrow="Basic" title="Buttons, badges and text" />
          <Stack direction="horizontal" gap="small" wrap>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="text">Text</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Saving</Button>
          </Stack>
          <Stack direction="horizontal" gap="small" wrap>
            {Object.keys(riskStatusTones).map((s) => (
              <StatusBadge key={s} status={s} tones={riskStatusTones} />
            ))}
            <Badge tone="accent">New</Badge>
            <Chip tone="brand">IFRS 9</Chip>
            <Tooltip content="Weighted average risk rating">
              <Button variant="text">WARR</Button>
            </Tooltip>
          </Stack>
          <SegmentedControl
            label="Information density"
            value={density}
            onChange={setDensity}
            options={[
              { value: "compact", label: "Compact" },
              { value: "regular", label: "Regular" },
              { value: "spacious", label: "Spacious" },
            ]}
          />

          <SectionHeader eyebrow="Forms" title="Inputs" />
          <Grid columns={2} gap="medium">
            <Field label="Facility amount" description="In Naira" required>
              <Input prefix="₦" placeholder="0.00" />
            </Field>
            <Field label="Sector">
              <Select placeholder="Choose a sector" options={[{ value: "agri", label: "Agriculture" }, { value: "mfg", label: "Manufacturing" }]} />
            </Field>
            <Field label="Credit memo summary" error="Summary is required">
              <Textarea />
            </Field>
            <Stack gap="small">
              <Checkbox label="Collateral perfected" />
              <Switch label="Notify credit admin" checked={alerts} onCheckedChange={setAlerts} />
            </Stack>
          </Grid>
          <FileUpload accept=".pdf,image/*" maxSizeMb={10} multiple onFilesChange={() => undefined} />

          <SectionHeader eyebrow="Blocks" title="Cards, teasers and feedback" />
          <Grid columns={4} gap="medium">
            <StatCard label="Portfolio at risk" value="4.2%" delta="-0.3pp" hint="vs last month" />
            <StatCard label="Applications" value="1,284" delta="+12%" />
            <StatCard label="Avg. turnaround" value="3.1 days" delta="-0.8" deltaIntent="positive" />
            <StatCard label="ECL coverage" value="2.7%" delta="0.0" deltaDirection="flat" />
          </Grid>
          <Grid columns={3} gap="medium">
            <Teaser icon={<Landmark />} title="Credit origination" description="Capture, analyse and decide on applications." href="#" cta="Learn more" />
            <Teaser icon={<FileCheck2 />} title="Offer letters" description="Generate offer letters from approved terms." href="#" cta="Learn more" />
            <Teaser icon={<ShieldCheck />} title="Collateral & legal" description="Track perfection, valuation and expiry." href="#" cta="Learn more" />
          </Grid>
          <Alert tone="warning" title="Covenant breach">Debt service cover fell below 1.2x for two obligors.</Alert>
          <Stack direction="horizontal" gap="small">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="tertiary" onClick={() => toast({ title: "Memo saved", tone: "success" })}>Show toast</Button>
          </Stack>
          <Modal open={modalOpen} onOpenChange={setModalOpen} title="Approve facility" description="This records your approval in the audit trail." footer={<Button onClick={() => setModalOpen(false)}>Approve</Button>}>
            Approval is final for this stage.
          </Modal>
          <Steps
            orientation="horizontal"
            items={[
              { title: "Origination", status: "complete" },
              { title: "Decisioning", status: "complete" },
              { title: "Offer letter", status: "current" },
              { title: "Disbursement", status: "upcoming" },
              { title: "Monitoring", status: "upcoming" },
            ]}
          />
          <Accordion type="single">
            <AccordionItem value="a" title="What is the 360 RAR?">A continuous, data-fed assessment of obligors and sectors.</AccordionItem>
            <AccordionItem value="b" title="Who approves decisions?">Accountable human roles. AI drafts, flags and recommends.</AccordionItem>
          </Accordion>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Obligors flagged this week</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Obligor</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell numeric>Exposure (₦m)</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[["Sample Agro Ltd", "WATCHLIST", "412.50"], ["Demo Foods Plc", "PERFORMING", "1,020.00"], ["Example Steel", "SUBSTANDARD", "88.10"]].map(([n, s, v]) => (
                    <TableRow key={n}>
                      <TableCell>{n}</TableCell>
                      <TableCell><StatusBadge status={s!} tones={riskStatusTones} /></TableCell>
                      <TableCell numeric>{v}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} pageCount={12} onPageChange={setPage} />
            </CardContent>
          </Card>

          <Tabs
            items={[
              { id: "overview", label: "Overview", content: <p className="text-fg-muted">Tabs follow the ARIA keyboard pattern.</p> },
              { id: "risk", label: "Risk", content: <p className="text-fg-muted">Risk tab content.</p> },
            ]}
          />
        </Stack>
      </Band>

      <Band id="charts" theme="light" spacing="large">
        <Stack gap="large">
          <SectionHeader eyebrow="Data viz" title="Charts follow the brand" />
          <Grid columns={3} gap="medium">
            <Card padding="medium"><BarChart data={[{ label: "Q1", value: 40 }, { label: "Q2", value: 55 }, { label: "Q3", value: 48 }, { label: "Q4", value: 70 }]} /></Card>
            <Card padding="medium"><LineChart series={[{ name: "NPL ratio", points: [{ x: "Jan", y: 5.1 }, { x: "Feb", y: 4.8 }, { x: "Mar", y: 4.6 }, { x: "Apr", y: 4.2 }] }]} /></Card>
            <Card padding="medium"><DonutChart segments={[{ label: "Stage 1", value: 82 }, { label: "Stage 2", value: 13 }, { label: "Stage 3", value: 5 }]} centerLabel="Loans" centerValue="100%" /></Card>
            <Card padding="medium"><Gauge value={68} label="Capital adequacy headroom" /></Card>
            <Card padding="medium">
              <Stack gap="small">
                <ProgressBar value={0.72} label="Review completion" showValue />
                <Sparkline values={[3, 5, 4, 6, 7, 6, 8]} />
                <RagIndicator status="amber" label="Liquidity" />
              </Stack>
            </Card>
            <Card padding="medium"><BarChart3 aria-hidden className="size-6 text-accent-500" /><p className="mt-2 text-sm text-fg-muted">Icons use lucide-react.</p></Card>
          </Grid>
        </Stack>
      </Band>

      <Band id="brand" spacing="large">
        <Grid columns={2} gap="large">
          <BrandSettingsPanel />
          <Card padding="large">
            <Stack gap="medium">
              <Logo size="large" />
              <Logo variant="stacked" size="xlarge" />
              <Logo variant="symbol" size="large" />
            </Stack>
          </Card>
        </Grid>
      </Band>

      <PageFooter
        tagline="Smart Enterprise Risk 360°"
        columns={[
          { title: "Library", links: [{ label: "Components", href: "#components" }, { label: "Charts", href: "#charts" }] },
          { title: "Brand", links: [{ label: "Brand settings", href: "#brand" }] },
        ]}
        legal={<>© Credigit Analytical Limited</>}
      />
      <Toaster />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrandProvider>
      <Gallery />
    </BrandProvider>
  </StrictMode>,
);
