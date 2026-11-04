import PageFrame from "../../components/PageFrame";
import EventsPage from "../../pages/EventsPage";
export const metadata={title:"My Events",robots:{index:false,follow:false}};
export default function Page(){return <PageFrame><EventsPage/></PageFrame>}
