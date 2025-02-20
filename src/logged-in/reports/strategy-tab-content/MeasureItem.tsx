import { IMeasureCompany } from "../../../shared/models/MeasureCompany";
import Rating from "../../shared/components/rating/Rating";

interface IProps {
  measure: IMeasureCompany;
}
const MeasureItem = (props: IProps) => {
  const { measure } = props;

  // const handleUpdateMeasure = () => {
  //   store.measure.select(measure); // select measure
  //   showModalFromId(MODAL_NAMES.EXECUTION.MEASURE_UPDATE_MODAL);
  // };

  return (
    <li className="red-measure">
      <div className="uk-flex uk-flex-middle">
        <Rating
          rate={measure.q4Rating || measure.q4AutoRating || 1}
          isUpdated={measure.isUpdated}
        />
        <div className="uk-margin-left">{measure.description}</div>
      </div>
    </li>
  );
};

export default MeasureItem;
