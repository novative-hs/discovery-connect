import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import SampleArea from "../components/sample/sample-area";

const SamplePage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Sample" subtitle="Sample List" />
        {/* breadcrumb end */}

        {/* sample area start */}
        <SampleArea />
        {/* sample area end */}
      </div>
    </Wrapper>
  );
};

export default SamplePage;
