import { Card, Figure, Row, Col } from "react-bootstrap";
import { ViewWrapper } from "../components/view-wrapper";
import { UserLink } from "../components/page-links";

const { Header, Body, Footer } = Card;

const publications = [
  {
    authors: "Thiele I, Palsson BØ",
    title: "A protocol for generating a high-quality genome-scale metabolic reconstruction",
    venue: "Nat Protoc",
    info: "5:93–121",
    year: 2010,
    doi: "10.1038/nprot.2009.203"
  },
  {
    authors: "Norsigian CJ, Fang X, Seif Y, Monk JM, Palsson BØ",
    title: "A workflow for generating multi-strain genome-scale metabolic models of prokaryotes",
    venue: "Nat Protoc",
    info: "15:1–14",
    year: 2020,
    doi: "10.1038/s41596-019-0254-3"
  },  
  {
    authors: "Price ND, Reed JL, Palsson BØ",
    title: "Genome-scale models of microbial cells: evaluating the consequences of constraints",
    venue: "Nat Rev Microbiol",
    info: "2:886–897",
    year: 2004,
    doi: "10.1038/nrmicro1023"
  },  
  {
    authors: "Lewis NE, Nagarajan H, Palsson BØ",
    title: "Constraining the metabolic genotype–phenotype relationship using a phylogeny of in silico methods",
    venue: "Nature Reviews Microbiology",
    info: "pp. 291–305",
    year: 2012,
    doi: "10.1038/nrmicro2737"
  },  
  {
    authors: "O’Brien EJ, Monk JM, Palsson BØ",
    title: "Using genome-scale models to predict biological capabilities",
    venue: "Cell",
    info: "161:971–987",
    year: 2015,
    doi: "10.1016/j.cell.2015.05.019"
  },  
  {
    authors: "Richelle A, Kellman BP, Wenzel AT, Chiang AWT, Reagan T, Gutierrez JM, Joshi C, Li S, Liu JK, Masson H, Lee J, Li Z, Heirendt L, Trefois C, Juarez EF, Bath T, Borland D, Mesirov JP, Robasky K, Lewis NE",
    title: "Model-based assessment of mammalian cell metabolic functionalities using omics data",
    venue: "Cell Rep Methods",
    info: "5:93–121",
    year: 2021,
    doi: "10.1016/j.crmeth.2021.100040"
  },  
  {
    authors: "Richelle A, Chiang AWT, Kuo C-C, Lewis NE",
    title: "Increasing consensus of context-specific metabolic models by integrating data-inferred cell functions",
    venue: "PLoS Comput Biol",
    info: "15:e1006867",
    year: 2019,
    doi: "10.1371/journal.pcbi.1006867"
  }
]

export const Home = () => {
  const publication = (publication, i) => (
    <li key={ i } className="mb-2">
      <>{ publication.authors }. </>
      <span className="text-dark">{ publication.title }. </span>
      <em>{ publication.venue }. </em>
      <>{ publication.info }. </>
      <>{ publication.year }. </>
      { publication.doi && 
        <a 
          className="text-muted"
          href={ `https://doi.org/${ publication.doi }` } 
          target="_blank" rel="noopener noreferrer"
        >
          { publication.doi }
        </a> 
      }
    </li>
  );

  return (   
    <ViewWrapper>
      <Card>
        <Header as="h5">
          About ImmCellFIE
        </Header>
        <Body>
          <Row>
            <Col xs={ 8 }>
              <p>
                <strong>ImmCellFIE is a portal for inferring cellular function given gene expression samples and their phenotypical data.</strong> Genome-scale network reconstructions are systematically organized and curated knowledgebases that quantitatively describe genotype-phenotype relationships [1,2].  Genome-scale models (GEMs) are mathematical representations of reconstructed networks that enable the simulation and prediction of pathway activity and flux, and ultimately phenotypic changes [3,4].  Complementary to traditional enrichment methods, these systems biology models provide quantitative and mechanistic insight into the output of pathways following molecular changes (e.g. differential gene expression).  Various methods enable one to analyze omics data in these models, including the popular approach of predicting cell growth and ​ metabolic fluxes using genome-scale metabolic networks [4,5]​. While these approaches yield a wealth of detailed insights into the mechanisms underlying complex biological processes, the reach of these approaches remains limited to those with a comprehensive background and specialized training in computational systems biology.
              </p>
              <p>
                To extend the reach of powerful systems biology techniques, CellFIE (Cell Function InferencE) is an intermediate approach​ [6] that combines the detailed systems biology input/output approach with the simplicity of enrichment analysis. The CellFIE method involves generating a set of curated model-derived “metabolic tasks,”[7]​ which are precomputed sets of genes that together consume a metabolite at the start of a pathway and produce a final metabolic product of interest​.  Using CellFIE, one can overlay transcriptomic or proteomic data onto these precomputed gene modules to predict pathway usage for each metabolic task, thus providing phenotype-relevant interpretation of how changes in complex omics experiments modify cell or tissue metabolic function. 
              </p>
              <p>
                The ImmCellFIE Portal makes CellFIE accessible to the broader immunology community and beyond by providing an easy-to-use and easy-to-extend webportal housing the CellFIE toolbox. ImmCellFIE integrates ImmPort data with other data sources enabling users to process and compare data using the CellFIE algorithm.  ImmCellFIE includes interactive visualization tools including heatmaps, treemaps, and Escher pathway visualizations to facilitate exploration and interpretability of CellFIE results.
              </p>
              <p>
                <UserLink className="mb-3"/><span style={{ verticalAlign: "middle", marginLeft: "-.5em" }}>to begin.</span>
              </p>
            </Col>
            <Col>
              <Figure>
                <Figure.Image src="TreeMap_small.png" />
              </Figure>
              <Figure>
                <Figure.Image src="Escher_small.png" />
              </Figure>
              <div className="text-end text-muted small mt-5">
                ImmCellFIE is funded by a grant from NIH/NIAID
                <br />
                #1UH2AI153029-01
              </div>
            </Col>
          </Row>
        </Body>
        <Footer>
          <ol className="text-muted small">
            { publications.map(publication) }
          </ol>
          <hr />
        </Footer>
      </Card>
    </ViewWrapper>
  ); 
};