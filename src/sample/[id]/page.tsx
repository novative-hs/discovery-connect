import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";
import SampleEditArea from "@/app/components/sample/sample-edit-area";

const SampleDynamicPage = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Sample" subtitle="Sample List" />
        {/* breadcrumb end */}

        {/* sample area start */}
        <SampleEditArea id={params.id} />
        {/* sample area end */}
      </div>
    </Wrapper>
  );
};

export default SampleDynamicPage;
